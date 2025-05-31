import {
  LIMIT_STATISTICS_BABYSITTER_LIST,
  MIN_REVIEWS_FOR_BABYSITTER_RANKING,
} from '@lib/common/constants';
import {
  DbName,
  EBookingStatus,
  ELanguage,
  EnumGender,
  EStatisticsBabysitterList,
  EUserRole,
} from '@lib/common/enums';
import {
  BookingEntity,
  BookingTimeEntity,
  CityEntity,
  UserEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository';
import { formatUser } from '@lib/utils';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Connection } from 'mongoose';
import { DataSource, IsNull, Not } from 'typeorm';
import { isEmpty } from 'lodash';

@Injectable()
export class StatisticsService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async getStatisticsCommon(
    query: { startDate?: Date; endDate?: Date },
    lang: ELanguage,
  ) {
    const baseBookingQuery = this.getRepository(
      this.postgresData,
      BookingEntity,
    )
      .createQueryBuilder('booking')
      .where(query.startDate ? 'booking.createdAt >= :startDate' : 'true', {
        startDate: query.startDate,
      })
      .andWhere(query.endDate ? 'booking.createdAt <= :endDate' : 'true', {
        endDate: query.endDate,
      });

    const userStats = await this.getRepository(this.postgresData, UserEntity)
      .createQueryBuilder('user')
      .select(
        'SUM(CASE WHEN user.role = :babysitterRole AND user.completed_signup IS NOT NULL AND user.is_marketing_account = false THEN 1 ELSE 0 END)',
        'totalBabysitter',
      )
      .addSelect(
        'SUM(CASE WHEN user.role = :parentRole AND user.completed_signup IS NOT NULL THEN 1 ELSE 0 END)',
        'totalParent',
      )
      .setParameters({
        babysitterRole: EUserRole.BABY_SITTER,
        parentRole: EUserRole.PARENT,
      })
      .getRawOne();

    // Query booking statistics
    const bookingStats = await baseBookingQuery
      .clone()
      .select(
        'SUM(CASE WHEN booking.status = :pendingStatus THEN 1 ELSE 0 END)',
        'totalBookingPending',
      )
      .addSelect(
        'SUM(CASE WHEN booking.status = :confirmedStatus THEN 1 ELSE 0 END)',
        'totalBookingConfirmed',
      )
      .addSelect(
        'SUM(CASE WHEN booking.status = :babySitterCancelStatus AND booking.isReject IS NULL THEN 1 ELSE 0 END)',
        'totalBookingAutoReject',
      )
      .addSelect(
        'SUM(CASE WHEN booking.status = :babySitterCancelStatus AND booking.isReject = true THEN 1 ELSE 0 END)',
        'totalBookingBabysitterReject',
      )
      .addSelect(
        'SUM(CASE WHEN booking.status = :parentCancelStatus AND booking.isReject = true THEN 1 ELSE 0 END)',
        'totalBookingParentReject',
      )
      .addSelect(
        'SUM(CASE WHEN booking.status = :parentCancelStatus AND booking.isReject = false THEN 1 ELSE 0 END)',
        'totalParentCancel',
      )
      .addSelect(
        'SUM(CASE WHEN booking.status = :babySitterCancelStatus AND booking.isReject = false THEN 1 ELSE 0 END)',
        'totalBabysitterCancel',
      )
      .setParameters({
        pendingStatus: EBookingStatus.PENDING,
        confirmedStatus: EBookingStatus.CONFIRMED,
        babySitterCancelStatus: EBookingStatus.BABY_SITTER_CANCEL,
        parentCancelStatus: EBookingStatus.PARENT_CANCEL,
      })
      .getRawOne();

    // Query completed bookings revenue
    const completedBookingStats = await baseBookingQuery
      .clone()
      .select('SUM(booking.prices)', 'totalRevenue')
      .addSelect('COUNT(booking.id)', 'totalBooking')
      .andWhere('booking.status = :completedStatus', {
        completedStatus: EBookingStatus.COMPLETED,
      })
      .getRawOne();

    const totalRevenue = parseInt(completedBookingStats?.totalRevenue);
    const totalCompletedBookings = parseInt(
      completedBookingStats?.totalBooking,
    );

    const bookingTimeSubQuery = this.getRepository(
      this.postgresData,
      BookingTimeEntity,
    )
      .createQueryBuilder('bookingTime')
      .select('1')
      .where('bookingTime.bookingId = booking.id')
      .andWhere(
        query.startDate ? 'bookingTime.startTime >= :startDate' : 'true',
      )
      .andWhere(query.endDate ? 'bookingTime.startTime <= :endDate' : 'true');

    const { entities, raw } = await this.getRepository(
      this.postgresData,
      UserEntity,
    )
      .createQueryBuilder('user')
      .leftJoin('user.userLanguages', 'userLanguage')
      .leftJoin('userLanguage.language', 'language')
      .leftJoin('user.currency', 'currency')
      .innerJoin(
        BookingEntity,
        'booking',
        `booking.status = :status 
         AND booking.babysitter_id = user.id 
         AND EXISTS (${bookingTimeSubQuery.getQuery()})`,
        {
          status: EBookingStatus.COMPLETED,
          startDate: query.startDate,
          endDate: query.endDate,
        },
      )
      .leftJoinAndMapOne(
        'user.avatar',
        'user.userImages',
        'avatar',
        'avatar.order = 0',
      )
      .select([
        'user.id',
        'user.userCode',
        'user.username',
        'user.numExperience',
        'user.salary',
        'currency.unit',
        'userLanguage.level',
        'language.languageCode',
        'avatar.url',
      ])
      .addSelect('SUM(booking.prices)', 'revenue')
      .groupBy('user.id, userLanguage.id, language.id, currency.id, avatar.id')
      .orderBy('revenue', 'DESC', 'NULLS LAST')
      .take(1)
      .getRawAndEntities();

    const babysitter = formatUser(entities[0], lang);
    babysitter.revenue = parseInt(raw[0]?.revenue || '0');

    return {
      totalMember:
        parseInt(userStats?.totalBabysitter) + parseInt(userStats?.totalParent),
      totalBabysitter: parseInt(userStats?.totalBabysitter),
      totalParent: parseInt(userStats?.totalParent),
      totalBookingPending: parseInt(bookingStats?.totalBookingPending),
      totalBookingConfirmed: parseInt(bookingStats?.totalBookingConfirmed),
      totalBookingAutoReject: parseInt(bookingStats?.totalBookingAutoReject),
      totalBookingBabysitterReject: parseInt(
        bookingStats?.totalBookingBabysitterReject,
      ),
      totalBookingParentReject: parseInt(
        bookingStats?.totalBookingParentReject,
      ),
      totalParentCancel: parseInt(bookingStats?.totalParentCancel),
      totalBabysitterCancel: parseInt(bookingStats?.totalBabysitterCancel),
      totalBookingCompleted: totalCompletedBookings,
      totalRevenueCompleted: totalRevenue,
      avgRevenueCompleted: Math.round(
        totalCompletedBookings ? totalRevenue / totalCompletedBookings : 0,
      ),
      babysitterHightestRevenue: babysitter,
    };
  }

  async getStatisticsBabysitter() {
    const userQuery = this.getRepository(this.postgresData, UserEntity)
      .createQueryBuilder('user')
      .where('user.role = :role', { role: EUserRole.BABY_SITTER });

    const babysitter = await userQuery
      .clone()
      .andWhere('user.completedSignup IS NOT NULL')
      .andWhere('user.isMarketingAccount = false')
      .select('COUNT(*)', 'totalBabysitter')
      .getRawOne();

    const booking = await this.getRepository(this.postgresData, BookingEntity)
      .createQueryBuilder('booking')
      .select('COALESCE(SUM(booking.prices), 0)', 'totalRevenue')
      .addSelect(
        `
        (
          SELECT COALESCE(SUM(b.prices), 0)
          FROM booking b
          WHERE EXTRACT(YEAR FROM b.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND b.status = :status
          GROUP BY b.babysitter_id
          ORDER BY SUM(b.prices) DESC
          LIMIT 1)
      `,
        'highestRevenue',
      )
      .where(
        'EXTRACT(YEAR FROM booking.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) AND booking.status = :status',
        {
          status: EBookingStatus.COMPLETED,
        },
      )
      .getRawOne();

    const rateBabysitter = await userQuery
      .clone()
      .leftJoin('user.socialAccount', 'socialAccount')
      .select(
        'ROUND(SUM(CASE WHEN user.gender = :male THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'male',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN user.gender = :female THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'female',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN EXTRACT(YEAR FROM AGE(NOW(), user.dob)) < 20 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'U20',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN EXTRACT(YEAR FROM AGE(NOW(), user.dob)) BETWEEN 20 AND 29 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'U30',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN EXTRACT(YEAR FROM AGE(NOW(), user.dob)) BETWEEN 30 AND 39 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'U40',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN EXTRACT(YEAR FROM AGE(NOW(), user.dob)) BETWEEN 40 AND 49 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'U50',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN user.email IS NOT NULL AND socialAccount.id IS NULL THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'email',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN socialAccount.provider = :google THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'google',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN socialAccount.provider = :kakaotalk THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'kakaotalk',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN socialAccount.provider = :facebook THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'facebook',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN socialAccount.provider = :apple THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'apple',
      )
      .setParameters({
        male: EnumGender.MALE,
        female: EnumGender.FEMALE,
        google: 'google',
        kakaotalk: 'kakaotalk',
        facebook: 'facebook',
        apple: 'apple',
      })
      .getRawOne();

    const result = {
      babysitter: {
        totalBabysitter: Number(babysitter.totalBabysitter),
      },
      booking: {
        totalRevenue: Number(booking.totalRevenue),
        highestRevenue: Number(booking.highestRevenue),
      },
      rateBabysitter: {
        male: Number(rateBabysitter.male),
        female: Number(rateBabysitter.female),
        U20: Number(rateBabysitter.U20),
        U30: Number(rateBabysitter.U30),
        U40: Number(rateBabysitter.U40),
        U50: Number(rateBabysitter.U50),
        email: Number(rateBabysitter.email),
        google: Number(rateBabysitter.google),
        kakaotalk: Number(rateBabysitter.kakaotalk),
        facebook: Number(rateBabysitter.facebook),
        apple: Number(rateBabysitter.apple),
      },
    };
    return result;
  }

  async getStatisticsBabysitterRegion(cityIds: string[]) {
    const queryBuilder = this.getRepository(this.postgresData, CityEntity)
      .createQueryBuilder('city')
      .select(['city.id', 'city.name'])
      .where('city.isUserCreated = false')
      .loadRelationCountAndMap(
        'city.countBabysitter',
        'city.babysitters',
        'babysitter',
        (qb) =>
          qb
            .where('babysitter.role = :role', { role: EUserRole.BABY_SITTER })
            .andWhere('babysitter.completedSignup IS NOT NULL')
            .andWhere('babysitter.isMarketingAccount = false'),
      );

    const queryBuilderOther = await this.getRepository(
      this.postgresData,
      UserEntity,
    )
      .createQueryBuilder('babysitter')
      .where('babysitter.role = :role', { role: EUserRole.BABY_SITTER })
      .andWhere('babysitter.completedSignup IS NOT NULL')
      .andWhere('babysitter.isMarketingAccount = false')
      .leftJoin('babysitter.city', 'city')
      .andWhere('city.isUserCreated = true')
    if (!isEmpty(cityIds)) {
      queryBuilderOther.andWhere('city.id IN (:...cityIds)', { cityIds });
    }
    const countBabysitterOtherCity = await queryBuilderOther.getCount();

    const result = await queryBuilder.getMany();
    return [...result, { countBabysitterOtherCity }];
  }

  async getStatisticsBabysitterList(type: EStatisticsBabysitterList) {
    const userQuery = this.getRepository(this.postgresData, UserEntity)
      .createQueryBuilder('user')
      .where('user.role = :role', { role: EUserRole.BABY_SITTER })
      .andWhere('user.completedSignup IS NOT NULL')
      .andWhere('user.isMarketingAccount = false')
      .select(['user.id', 'user.username', 'user.phone', 'user.email']);

    switch (type) {
      case EStatisticsBabysitterList.MOST_SEARCH_BABYSITTER:
        userQuery
          .leftJoin('user.bookings', 'booking')
          .groupBy('user.id')
          .addSelect('COUNT(booking.id)', 'count_booking')
          .orderBy('count_booking', 'DESC');
        break;
      case EStatisticsBabysitterList.MOST_RATE_BABYSITTER:
        userQuery
          .leftJoin('user.ratingUser', 'ratingUser')
          .groupBy('user.id')
          .addSelect('COUNT(ratingUser.id)', 'count_rate')
          .having('COUNT(ratingUser.id) > :num', {
            num: MIN_REVIEWS_FOR_BABYSITTER_RANKING,
          })
          .orderBy('user.avgRating', 'DESC');
        break;
      case EStatisticsBabysitterList.WORST_RATE_BABYSITTER:
        userQuery
          .leftJoin('user.ratingUser', 'ratingUser')
          .groupBy('user.id')
          .addSelect('COUNT(ratingUser.id)', 'count_rate')
          .having('COUNT(ratingUser.id) > :num', {
            num: MIN_REVIEWS_FOR_BABYSITTER_RANKING,
          })
          .orderBy('user.avgRating', 'ASC');
        break;
    }

    return userQuery.limit(LIMIT_STATISTICS_BABYSITTER_LIST).getMany();
  }

  async getStatisticsParent() {
    const totalParent = await this.count(this.postgresData, UserEntity, {
      where: { role: EUserRole.PARENT, completedSignup: Not(IsNull()) },
    });

    const cityQuery = this.getRepository(
      this.postgresData,
      CityEntity,
    ).createQueryBuilder('city');

    const cities = await cityQuery
      .clone()
      .leftJoin('city.bookings', 'booking', 'booking.status != :status', {
        status: EBookingStatus.DRAFT,
      })
      .select('city.id', 'cityId')
      .addSelect('city.name', 'cityName')
      .addSelect(
        'SUM(CASE WHEN booking.created_at BETWEEN :startOfCurrentMonth AND :endOfCurrentMonth THEN 1 ELSE 0 END)',
        'totalBookingCurrentMonth',
      )
      .addSelect(
        'SUM(CASE WHEN booking.created_at BETWEEN :startOfLastMonth AND :endOfLastMonth THEN 1 ELSE 0 END)',
        'totalBookingLastMonth',
      )
      .setParameters({
        startOfCurrentMonth: moment().startOf('month').toDate(),
        endOfCurrentMonth: moment().endOf('month').toDate(),
        startOfLastMonth: moment()
          .startOf('month')
          .subtract(1, 'month')
          .toDate(),
        endOfLastMonth: moment().endOf('month').subtract(1, 'month').toDate(),
      })
      .groupBy('city.id')
      .getRawMany();

    cities.forEach((city) => {
      city.totalBookingCurrentMonth = parseInt(city.totalBookingCurrentMonth);
      city.totalBookingLastMonth = parseInt(city.totalBookingLastMonth);
    });

    const userQuery = this.getRepository(this.postgresData, UserEntity)
      .createQueryBuilder('user')
      .where('user.role = :role', { role: EUserRole.PARENT });

    const rateParents = await userQuery
      .clone()
      .leftJoin('user.socialAccount', 'socialAccount')
      .select(
        'ROUND(SUM(CASE WHEN user.gender = :male THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'male',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN user.gender = :female THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'female',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN EXTRACT(YEAR FROM AGE(NOW(), user.dob)) < 20 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'U20',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN EXTRACT(YEAR FROM AGE(NOW(), user.dob)) BETWEEN 20 AND 29 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'U30',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN EXTRACT(YEAR FROM AGE(NOW(), user.dob)) BETWEEN 30 AND 39 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'U40',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN EXTRACT(YEAR FROM AGE(NOW(), user.dob)) BETWEEN 40 AND 49 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'U50',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN user.email IS NOT NULL AND socialAccount.id IS NULL THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'email',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN socialAccount.provider = :google THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'google',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN socialAccount.provider = :kakaotalk THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'kakaotalk',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN socialAccount.provider = :facebook THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'facebook',
      )
      .addSelect(
        'ROUND(SUM(CASE WHEN socialAccount.provider = :apple THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2)',
        'apple',
      )
      .setParameters({
        male: EnumGender.MALE,
        female: EnumGender.FEMALE,
        google: 'google',
        kakaotalk: 'kakaotalk',
        facebook: 'facebook',
        apple: 'apple',
      })
      .getRawOne();

    const { entities, raw } = await userQuery
      .clone()
      .leftJoinAndMapOne(
        'user.avatar',
        'user.userImages',
        'avatar',
        'avatar.order = 0',
      )
      .leftJoin(
        'user.bookingParents',
        'bookingParent',
        'bookingParent.status != :status',
        { status: EBookingStatus.DRAFT },
      )
      .groupBy('user.id, avatar.id')
      .select([
        'user.id',
        'user.username',
        'avatar.url',
        'user.phone',
        'user.email',
      ])
      .addSelect('COUNT(bookingParent.id)', 'count_booking')
      .orderBy('count_booking', 'DESC')
      .getRawAndEntities();
    const parents = entities.map((parent) => {
      parent.countBooking = parseInt(
        raw.find((p) => p.user_id === parent.id)?.count_booking,
      );
      return parent;
    });
    return {
      totalParent,
      cities,
      rateParents: {
        male: Number(rateParents.male),
        female: Number(rateParents.female),
        U20: Number(rateParents.U20),
        U30: Number(rateParents.U30),
        U40: Number(rateParents.U40),
        U50: Number(rateParents.U50),
        email: Number(rateParents.email),
        google: Number(rateParents.google),
        kakaotalk: Number(rateParents.kakaotalk),
        facebook: Number(rateParents.facebook),
        apple: Number(rateParents.apple),
      },
      parents,
    };
  }
}
