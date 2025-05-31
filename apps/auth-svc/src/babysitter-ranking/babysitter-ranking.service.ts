import {
  errorMessage,
  LIMIT_BABYSITTER_RANKING,
  MIN_REVIEWS_FOR_BABYSITTER_RANKING,
} from '@lib/common/constants';
import {
  DbName,
  EBookingStatus,
  ELanguage,
  EUserRole,
} from '@lib/common/enums';
import { IRequestUser } from '@lib/common/interfaces';
import {
  BabysitterRankingEntity,
  BookingEntity,
  BookingTimeEntity,
  ERankingType,
  UserEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository';
import { formatUser } from '@lib/utils';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Connection } from 'mongoose';
import { DataSource, In, Not, SelectQueryBuilder } from 'typeorm';
import { isEmpty } from 'lodash';

@Injectable()
export class BabysitterRankingService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async getBabysitterRanking(
    reqUser: IRequestUser,
    lang: ELanguage,
    type: ERankingType,
  ) {
    const queryBuilder = this.createBaseQuery();

    this.applyRankingFilter(queryBuilder, type);
    this.applyUserRoleFilter(queryBuilder, reqUser, type);

    const babysitters = await this.fetchRankedBabysitters(
      queryBuilder,
      lang,
      type,
    );

    // If requesting user is a babysitter, include their ranking details
    if (reqUser.role === EUserRole.BABY_SITTER) {
      const babysitterDetails = await this.fetchRequestingBabysitterDetails(
        reqUser,
        lang,
        type,
      );
      babysitters.unshift(babysitterDetails);
    }

    return babysitters;
  }

  private createBaseQuery() {
    return this.getRepository(this.postgresData, UserEntity)
      .createQueryBuilder('user')
      .leftJoin('user.userLanguages', 'userLanguage')
      .leftJoin('userLanguage.language', 'language')
      .leftJoin('user.currency', 'currency')
      .leftJoinAndMapOne(
        'user.avatar',
        'user.userImages',
        'avatar',
        'avatar.order = 0',
      )
      .loadRelationCountAndMap(
        'user.countComment',
        'user.ratingUser',
        'ratingUser',
        (qb) => qb.innerJoin('ratingUser.comment', 'comment'),
      )
      .loadRelationCountAndMap(
        'user.countUserLiked',
        'user.favoriteBabysitters',
      )
      .where('user.role = :role', { role: EUserRole.BABY_SITTER })
      .andWhere('user.completedSignup IS NOT NULL')
      .andWhere('user.isMarketingAccount = :isMarketingAccount', {
        isMarketingAccount: false,
      })
      .select([
        'user.id',
        'avatar.url',
        'user.username',
        'user.numExperience',
        'user.salary',
        'userLanguage.id',
        'userLanguage.level',
        'language.id',
        'language.languageCode',
        'currency.unit',
      ])
      .groupBy('user.id, userLanguage.id, language.id, currency.id, avatar.id');
  }

  private applyRankingFilter(
    queryBuilder: SelectQueryBuilder<UserEntity>,
    type: ERankingType,
  ) {
    const yesterday = moment().subtract(1, 'days').endOf('day');
    if (type === ERankingType.RATING) {
      this.applyRatingRanking(queryBuilder, yesterday);
    } else {
      this.applyRevenueRanking(queryBuilder, type, yesterday);
    }
  }

  private async fetchRankedBabysitters(
    queryBuilder: SelectQueryBuilder<UserEntity>,
    lang: ELanguage,
    type: ERankingType,
  ) {
    const { entities, raw } = await queryBuilder
      .take(LIMIT_BABYSITTER_RANKING)
      .getRawAndEntities();

    if (isEmpty(entities)) return [];

    return entities.map((user) => {
      user.revenue = parseInt(
        raw.find((item) => item.user_id === user.id)?.revenue || '0',
      );
      user.avgRating = parseFloat(
        raw.find((item) => item.user_id === user.id)?.avg_rating || '0',
      );
      return formatUser(user, lang);
    });
  }

  private async fetchRequestingBabysitterDetails(
    reqUser: IRequestUser,
    lang: ELanguage,
    type: ERankingType,
  ) {
    const userQuery = this.createBaseQuery();
    this.applyPersonalRankingFilter(userQuery, type);

    const { entities, raw } = await userQuery
      .andWhere('user.id = :id', { id: reqUser.userId })
      .getRawAndEntities();

    const babysitter = formatUser(entities[0], lang);
    babysitter.revenue = parseInt(
      raw.find((item) => item.user_id === reqUser.userId)?.revenue || '0',
    );
    babysitter.avgRating = parseFloat(
      raw.find((item) => item.user_id === reqUser.userId)?.avg_rating || '0',
    );

    return babysitter;
  }

  private applyPersonalRankingFilter(
    queryBuilder: SelectQueryBuilder<UserEntity>,
    type: ERankingType,
  ) {
    const yesterday = moment().subtract(1, 'days').endOf('day');
    if (type === ERankingType.RATING) {
      const startDate = moment(yesterday).subtract(3, 'months').toDate();
      queryBuilder
        .leftJoin(
          'user.ratingUser',
          'ru',
          'ru.createdAt BETWEEN :startDate AND :yesterday',
          {
            startDate,
            yesterday,
          },
        )
        .addSelect('AVG(ru.point)', 'avg_rating');
    } else {
      const startDay = this.getRevenueStartDate(type, yesterday);
      queryBuilder
        .leftJoin(
          BookingEntity,
          'booking',
          `booking.status = :status 
           AND booking.babysitter_id = user.id 
           AND EXISTS (${this.bookingTimeSubQuery().getQuery()})`,
          {
            status: EBookingStatus.COMPLETED,
            startDate: startDay,
            endDate: yesterday.toDate(),
          },
        )
        .addSelect('SUM(booking.prices)', 'revenue');
    }
  }

  private getRevenueStartDate(
    type: ERankingType,
    referenceDate: moment.Moment,
  ) {
    return (
      type === ERankingType.MONTHLY_INCOME
        ? referenceDate.clone().subtract(1, 'months')
        : referenceDate.clone().subtract(1, 'years')
    ).toDate();
  }

  private applyUserRoleFilter(
    queryBuilder: SelectQueryBuilder<UserEntity>,
    reqUser: IRequestUser,
    type: ERankingType,
  ) {
    if ([EUserRole.ADMIN, EUserRole.MANAGER].includes(reqUser.role)) {
      queryBuilder
        .leftJoinAndMapOne(
          'user.babysitterRanking',
          'user.babysitterRankings',
          'babysitterRanking',
          'babysitterRanking.rankingType = :type',
          { type },
        )
        .addSelect(['babysitterRanking.id'])
        .addGroupBy('babysitterRanking.id');
    } else {
      queryBuilder.innerJoin(
        'user.babysitterRankings',
        'babysitterRankings',
        'babysitterRankings.rankingType = :type',
        { type },
      );
    }
  }

  private applyRatingRanking(
    queryBuilder: SelectQueryBuilder<UserEntity>,
    yesterday: moment.Moment,
  ) {
    const startDate = moment(yesterday).subtract(3, 'months').toDate();
    queryBuilder
      .leftJoin('user.ratingUser', 'ru')
      .andWhere('ru.createdAt BETWEEN :startDate AND :yesterday', {
        startDate,
        yesterday,
      })
      .addSelect('AVG(ru.point)', 'avg_rating')
      .orderBy('avg_rating', 'DESC')
      .having('COUNT(ru.id) >= :min', {
        min: MIN_REVIEWS_FOR_BABYSITTER_RANKING,
      });
  }

  private applyRevenueRanking(
    queryBuilder: SelectQueryBuilder<UserEntity>,
    type: ERankingType,
    yesterday: moment.Moment,
  ) {
    const startDay = (
      type === ERankingType.MONTHLY_INCOME
        ? moment(yesterday).subtract(1, 'months')
        : moment(yesterday).subtract(1, 'years')
    ).toDate();

    queryBuilder
      .innerJoin(
        BookingEntity,
        'booking',
        `booking.status = :status 
         AND booking.babysitter_id = user.id 
         AND EXISTS (${this.bookingTimeSubQuery().getQuery()})`,
        {
          status: EBookingStatus.COMPLETED,
          startDate: startDay,
          endDate: yesterday.toDate(),
        },
      )
      .addSelect('SUM(booking.prices)', 'revenue')
      .orderBy('revenue', 'DESC');
  }

  private bookingTimeSubQuery() {
    return this.getRepository(this.postgresData, BookingTimeEntity)
      .createQueryBuilder('bookingTime')
      .select('1')
      .where('bookingTime.bookingId = booking.id')
      .andWhere('bookingTime.startTime >= :startDate')
      .andWhere('bookingTime.startTime <= :endDate');
  }

  async saveBabysitterRanking(babysitterIds: string[], type: ERankingType) {
    try {
      if (!isEmpty(babysitterIds)) {
        const countBabysitter = await this.count(
          this.postgresData,
          UserEntity,
          { where: { id: In(babysitterIds), role: EUserRole.BABY_SITTER } },
        );
        if (countBabysitter !== babysitterIds.length) {
          throw new BadRequestException(errorMessage.BAD_REQUEST);
        }
      }

      await this.delete(this.postgresData, BabysitterRankingEntity, {
        rankingType: type,
      });

      const babysitterRankings = babysitterIds.map((id) =>
        this.createInstance(this.postgresData, BabysitterRankingEntity, {
          babysitterId: id,
          rankingType: type,
        }),
      );

      await this.create(
        this.postgresData,
        BabysitterRankingEntity,
        babysitterRankings,
      );

      return true;
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }
}
