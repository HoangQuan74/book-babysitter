import {
  AgeOfChildText,
  errorMessage,
  MAX_PIN_BOOKING_CONVERSATION,
} from '@lib/common/constants';
import {
  DbName,
  EAgeType,
  EBookingStatus,
  ELanguage,
  EUserRole,
} from '@lib/common/enums';
import {
  IBooking,
  IBookingTime,
  IQuery,
  IQueryBooking,
  IRequestUser,
} from '@lib/common/interfaces';
import {
  BookingChildrenEntity,
  BookingEntity,
  BookingTimeEntity,
  CityEntity,
  CountryEntity,
  ENotificationBackgroundType,
  UserEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { generateBookingCode } from '@lib/utils/helpers';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { isEmpty } from 'lodash';
import { Connection } from 'mongoose';
import { Brackets, DataSource, IsNull, Not } from 'typeorm';
import * as moment from 'moment';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BookingService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,

    private readonly notifyService: NotificationService,
  ) {
    super();
  }

  async getBookings(query: IQuery) {
    const { page, limit, q } = query;
    const queryBuilder = this.getRepository(this.postgresData, BookingEntity)
      .createQueryBuilder('booking')
      .leftJoin('booking.parent', 'parent')
      .leftJoin('booking.babysitter', 'babysitter')
      .select([
        'booking.id',
        'booking.status',
        'booking.bookCode',
        'booking.createdAt',
      ])
      .where('booking.status != :status', { status: EBookingStatus.DRAFT });

    if (q) {
      queryBuilder
        .andWhere(
          new Brackets((qb) =>
            qb
              .orWhere('booking.bookCode = :q')
              .orWhere('parent.userCode = :q')
              .orWhere('babysitter.userCode = :q'),
          ),
        )
        .setParameters({ q });
    }

    const [results, total] = await queryBuilder
      .orderBy('booking.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { results, total };
  }

  async getBookingSchedules(
    reqUser: IRequestUser,
    query: any,
    lang: ELanguage,
  ) {
    const { userId } = reqUser;
    const { startDate, endDate } = query;

    const queryBuilder = this.getRepository(
      this.postgresData,
      BookingTimeEntity,
    )
      .createQueryBuilder('bookingTime')
      .leftJoin('bookingTime.booking', 'booking')
      .leftJoin('booking.parent', 'parent')
      .leftJoin('booking.babysitter', 'babysitter')
      .where('booking.status IN (:...status)', {
        status: [EBookingStatus.CONFIRMED, EBookingStatus.COMPLETED],
      })
      .leftJoinAndMapOne(
        'babysitter.avatar',
        'babysitter.userImages',
        'avatar',
        'avatar.order = 0',
      )
      .leftJoin('booking.currency', 'currency')
      .select([
        'bookingTime.id',
        'bookingTime.startTime',
        'bookingTime.endTime',
        'bookingTime.hasBreakTime',
        'booking.id',
        'booking.status',
        'booking.bookCode',
        'booking.createdAt',
        'booking.address',
        'booking.prices',
        'booking.paymentMethod',
        'parent.id',
        'parent.userCode',
        'parent.username',
        'parent.email',
        'babysitter.id',
        'babysitter.userCode',
        'babysitter.username',
        'babysitter.email',
        'avatar.url',
        'currency.id',
        'currency.unit',
      ]);

    if (reqUser.role === EUserRole.PARENT) {
      queryBuilder.andWhere('booking.parentId = :userId', { userId });
    } else if (reqUser.role === EUserRole.BABY_SITTER) {
      queryBuilder.andWhere('booking.babysitterId = :userId', { userId });
    }

    if (startDate) {
      queryBuilder.andWhere('bookingTime.startTime >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('bookingTime.endTime <= :endDate', {
        endDate,
      });
    }

    const results = await queryBuilder
      .orderBy('bookingTime.startTime', 'ASC')
      .getMany();

    return results;
  }

  async getUserBookings(
    reqUser: IRequestUser,
    query: IQueryBooking,
    lang: ELanguage,
  ) {
    const { userId } = reqUser;
    const { limit, page, status } = query;

    const queryBuilder = this.getRepository(this.postgresData, BookingEntity)
      .createQueryBuilder('booking')
      .leftJoin('booking.parent', 'parent')
      .leftJoin('booking.babysitter', 'babysitter')
      .leftJoin('booking.bookingTimes', 'bookingTime')
      .leftJoin('booking.currency', 'currency')
      .leftJoin('booking.city', 'city')
      .leftJoin('booking.rating', 'rating')
      .leftJoinAndMapOne(
        'babysitter.avatar',
        'babysitter.userImages',
        'avatar',
        'avatar.order = 0',
      )
      .select([
        'booking.id',
        'booking.status',
        'booking.bookCode',
        'booking.createdAt',
        'booking.prices',
        'booking.address',
        'booking.paymentMethod',
        'booking.canceledAt',
        'booking.isReject',
        'parent.id',
        'parent.userCode',
        'parent.username',
        'parent.email',
        'babysitter.id',
        'babysitter.userCode',
        'babysitter.username',
        'babysitter.email',
        'avatar.url',
        'bookingTime.id',
        'bookingTime.startTime',
        'bookingTime.endTime',
        'bookingTime.hasBreakTime',
        'currency.id',
        'currency.unit',
        'city.id',
        'city.name',
        'rating.id',
      ]);

    if (reqUser.role === EUserRole.PARENT) {
      queryBuilder.andWhere('booking.parentId = :userId', { userId });
    } else if (reqUser.role === EUserRole.BABY_SITTER) {
      queryBuilder.andWhere('booking.babysitterId = :userId', { userId });
    }

    if (!isEmpty(status)) {
      queryBuilder.andWhere('booking.status IN (:...status)', {
        status: status,
      });
    }

    const [results, total] = await queryBuilder
      .orderBy('booking.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { results, total };
  }

  async getBookingDetail(
    lang: ELanguage,
    reqUser: IRequestUser,
    id: string = null,
    bookCode: string = null,
    babysitterId: string = null,
  ) {
    try {
      const queryBuilder = this.getRepository(this.postgresData, BookingEntity)
        .createQueryBuilder('booking')
        .leftJoin('booking.parent', 'parent')
        .leftJoin('booking.babysitter', 'babysitter')
        .leftJoin('booking.bookingChildren', 'bookingChildren')
        .leftJoin('booking.bookingTimes', 'bookingTimes')
        .leftJoin('booking.currency', 'currency')
        .leftJoinAndMapOne(
          'babysitter.avatar',
          'babysitter.userImages',
          'avatar',
          'avatar.order = 0',
        )
        .leftJoinAndMapOne(
          'parent.avatarParent',
          'parent.userImages',
          'avatarParent',
          'avatarParent.order = 0',
        )
        .withDeleted()
        .leftJoin('booking.city', 'city')
        .leftJoin('city.country', 'country')
        .addSelect([
          'parent.id',
          'parent.userCode',
          'parent.username',
          'parent.email',
          'babysitter.id',
          'babysitter.userCode',
          'babysitter.username',
          'babysitter.email',
          'babysitter.phone',
          'avatar.url',
          'avatarParent.url',
          'city.id',
          'city.name',
          'country.id',
          'country.name',
          'bookingChildren.id',
          'bookingChildren.dob',
          'bookingChildren.gender',
          'bookingTimes.id',
          'bookingTimes.startTime',
          'bookingTimes.endTime',
          'bookingTimes.hasBreakTime',
          'currency.id',
          'currency.unit',
        ]);

      if (id) {
        queryBuilder.andWhere('booking.id = :id', { id });
      } else if (bookCode) {
        queryBuilder.andWhere('booking.bookCode = :bookCode', { bookCode });
      } else if (babysitterId) {
        queryBuilder
          .andWhere('booking.babysitterId = :babysitterId', {
            babysitterId,
          })
          .andWhere('booking.status = :status', {
            status: EBookingStatus.DRAFT,
          })
          .orderBy('booking.createdAt', 'DESC');
      }
      const booking = await queryBuilder.getOne();

      if (!booking) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      booking.bookingChildren = this.calculateAgeOfChild(
        booking.bookingChildren,
      );

      if (
        reqUser?.role === EUserRole.BABY_SITTER &&
        reqUser.userId === booking.babysitterId
      ) {
        booking.isViewed = true;
        this.update(
          this.postgresData,
          BookingEntity,
          { id: booking.id },
          { isViewed: true },
        );

        if (booking.babysitter) {
          booking.babysitter.countConfirmedBookingCancellations =
            await this.countConfirmedBookingCancellations(booking.babysitterId);
        }
      }

      return booking;
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  private async countConfirmedBookingCancellations(babySitterId: string) {
    return await this.count(this.postgresData, BookingEntity, {
      where: {
        babysitterId: babySitterId,
        status: EBookingStatus.BABY_SITTER_CANCEL,
        isReject: false,
      },
    });
  }

  private calculateAgeOfChild(bookingChildren: BookingChildrenEntity[]) {
    return bookingChildren.map((child) => {
      child.age = this.calculateAge(child.dob);
      return child;
    });
  }

  private calculateAge(dob: Date) {
    let age = moment().diff(dob, 'years');
    if (age >= 4) {
      return AgeOfChildText(age)[EAgeType.YEAR];
    }
    age = moment().diff(dob, 'months');
    return AgeOfChildText(age)[EAgeType.MONTH];
  }

  async createBooking(reqUser: IRequestUser, data: IBooking) {
    try {
      const babysitter = await this.checkBabysitter(data.babysitterId);

      const cityId = data?.cityId ?? babysitter.cityId;
      const city = await this.checkCountryAndCity(data?.countryId, cityId);

      const bookingChildren = data?.bookingChildren?.map((child) =>
        this.createInstance(this.postgresData, BookingChildrenEntity, {
          dob: child.dob,
          gender: child.gender,
        }),
      );

      const bookingTimes = data?.bookingTimes?.map((time) =>
        this.createInstance(this.postgresData, BookingTimeEntity, {
          startTime: time.startTime,
          endTime: time.endTime,
          hasBreakTime: time.hasBreakTime,
        }),
      );

      const numBooking = await this.getCurrentBookingCode(cityId);

      const result = await this.create(this.postgresData, BookingEntity, {
        parentId: data.parentId,
        babysitterId: data.babysitterId,
        address: data?.address,
        cityId: cityId,
        numOfChildren: data?.numOfChildrenCared,
        status: data?.status,
        bookingChildren: bookingChildren || null,
        bookingTimes: bookingTimes,
        bookCode: generateBookingCode(numBooking, city?.code),
        prices: data.bookingTimes
          ? this.calculateSalary(babysitter.salary, data.bookingTimes)
          : 0,
        currencyId: babysitter.currencyId,
      });

      result.city = city;
      result.babysitter = babysitter;

      if (data.status === EBookingStatus.DRAFT) {
        this.notifyService.createConversation(
          data.parentId,
          babysitter.id,
          data.message,
        );
        return result;
      }

      this.notifyService.sendNotification(
        ENotificationBackgroundType.REQUEST_BOOKING_CONFIRMATION,
        data.babysitterId,
        result.id,
      );
      this.notifyService.createMessage(result, result.status);

      return result;
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  private async getCurrentBookingCode(cityId: string) {
    const now = moment();
    const startMonth = moment(now).startOf('month').toDate();
    const endMonth = moment(now).endOf('month').toDate();

    const result = await this.getRepository(this.postgresData, BookingEntity)
      .createQueryBuilder('booking')
      .withDeleted()
      .select('MAX(booking.bookCode)', 'bookCode')
      .andWhere('booking.cityId = :cityId', { cityId })
      .andWhere('booking.createdAt >= :startMonth', { startMonth })
      .andWhere('booking.createdAt <= :endMonth', { endMonth })
      .getRawOne();

    if (!result || !result.bookCode) {
      return 0;
    }

    const bookCodeParts = result.bookCode.split('-');
    const lastPart = bookCodeParts[bookCodeParts.length - 1];
    const numericPart = parseInt(lastPart, 10);
    return numericPart;
  }

  private async checkCountryAndCity(countryId: string, cityId: string) {
    const [isExistCountry, city] = await Promise.all([
      this.exist(this.postgresData, CountryEntity, {
        where: { id: countryId },
      }),
      this.getOne(this.postgresData, CityEntity, {
        where: { id: cityId },
        withDeleted: true,
        select: { id: true, code: true, name: true },
      }),
    ]);

    if (!isExistCountry || !city) {
      throw new BadRequestException(errorMessage.BAD_REQUEST);
    }

    return city;
  }

  private async checkBabysitter(babysitterId: string) {
    const babysitter = await this.getOne(this.postgresData, UserEntity, {
      where: { id: babysitterId, role: EUserRole.BABY_SITTER },
      select: {
        id: true,
        salary: true,
        currencyId: true,
        cityId: true,
        username: true,
      },
    });

    if (!babysitter) throw new BadRequestException(errorMessage.BAD_REQUEST);

    return babysitter;
  }

  private calculateSalary(
    baseSalary: number,
    bookingTimes: IBookingTime[],
  ): number {
    const result = bookingTimes?.reduce((totalSalary, time) => {
      const { startTime, endTime, hasBreakTime } = time;

      const start = new Date(startTime);
      const end = new Date(endTime);

      const breakDuration = hasBreakTime ? 1 : 0;
      const workDuration = (end.getTime() - start.getTime()) / (60 * 60 * 1000);
      const adjustedDuration = workDuration - breakDuration;

      return totalSalary + adjustedDuration * baseSalary;
    }, 0);
    return Math.round(result);
  }

  async cancelBooking(data: any) {
    try {
      const { id, reasonCancel, canceledBy } = data;
      const booking = await this.getOne(this.postgresData, BookingEntity, {
        where: { id },
      });

      const canCancelStatuses = [
        EBookingStatus.PENDING,
        EBookingStatus.CONFIRMED,
      ];

      if (!booking) {
        throw new BadRequestException(errorMessage.BOOKING_NOT_FOUND);
      }

      if (!canCancelStatuses.includes(booking.status)) {
        throw new BadRequestException(errorMessage.BOOKING_CANT_BE_CANCEL);
      }

      booking.isReject = booking.status === EBookingStatus.PENDING;

      if (canceledBy === EUserRole.BABY_SITTER) {
        booking.status = EBookingStatus.BABY_SITTER_CANCEL;
        const typeNotify = booking.isReject
          ? ENotificationBackgroundType.BOOKING_REJECTED
          : ENotificationBackgroundType.BOOKING_CANCELED_BY_BABYSITTER;
        this.notifyService.sendNotification(
          typeNotify,
          booking.parentId,
          booking.id,
        );
      } else {
        booking.status = EBookingStatus.PARENT_CANCEL;
        this.notifyService.sendNotification(
          ENotificationBackgroundType.BOOKING_CANCELED_BY_PARENT,
          booking.babysitterId,
          booking.id,
        );
      }
      booking.reasonCancel = reasonCancel;
      booking.canceledAt = new Date();

      this.notifyService.createMessage(
        booking,
        booking.status,
        booking.isReject,
      );

      return this.create(this.postgresData, BookingEntity, booking);
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async confirmBooking(reqUser: IRequestUser, bookingId: string) {
    try {
      const booking = await this.getOne(this.postgresData, BookingEntity, {
        where: { id: bookingId },
      });
      if (!booking) {
        throw new BadRequestException(errorMessage.BOOKING_NOT_FOUND);
      }

      if (booking.status === EBookingStatus.PENDING) {
        booking.status = EBookingStatus.CONFIRMED;
      } else {
        throw new BadRequestException(errorMessage.BOOKING_NOT_PENDING);
      }

      booking.confirmedAt = new Date();
      const result = await this.create(
        this.postgresData,
        BookingEntity,
        booking,
      );

      this.notifyService.sendNotification(
        ENotificationBackgroundType.BOOKING_CONFIRMED,
        booking.parentId,
        booking.id,
      );
      this.notifyService.createMessage(result, result.status);

      return result;
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async getBookingNotifications(reqUser: IRequestUser, query: any) {
    const { status } = query;
    const { userId } = reqUser;
    const queryBuilder = this.getRepository(this.postgresData, BookingEntity)
      .createQueryBuilder('booking')
      .leftJoin('booking.parent', 'parent')
      .leftJoin('booking.babysitter', 'babysitter')
      .leftJoin('booking.bookingTimes', 'bookingTime')
      .leftJoin('booking.currency', 'currency')
      .select([
        'booking.id',
        'booking.status',
        'booking.bookCode',
        'booking.createdAt',
        'booking.prices',
        'booking.address',
        'booking.paymentMethod',
        'booking.canceledAt',
        'parent.id',
        'parent.userCode',
        'parent.username',
        'parent.email',
        'babysitter.id',
        'babysitter.userCode',
        'babysitter.username',
        'babysitter.email',
        'bookingTime.id',
        'bookingTime.startTime',
        'bookingTime.endTime',
        'bookingTime.hasBreakTime',
        'currency.id',
        'currency.unit',
      ])
      .where('booking.babysitterId = :userId', { userId })
      .andWhere('booking.status IN (:...status)', { status })
      .andWhere('booking.isViewed = :isViewed', { isViewed: false });

    if (status.includes(EBookingStatus.PENDING)) {
      queryBuilder.orderBy('booking.createdAt', 'ASC');
    } else {
      queryBuilder.orderBy('booking.canceledAt', 'DESC');
    }

    const results = await queryBuilder.getMany();
    return results;
  }

  async getBookingWithPartner(
    partnerId: string,
    reqUser: IRequestUser,
    query: IQuery,
  ) {
    const isBabysitter = reqUser.role === EUserRole.BABY_SITTER;

    const babysitterId = isBabysitter ? reqUser.userId : partnerId;
    const parentId = isBabysitter ? partnerId : reqUser.userId;

    const [results, total] = await this.getRepository(
      this.postgresData,
      BookingEntity,
    )
      .createQueryBuilder('booking')
      .leftJoin('booking.bookingTimes', 'bookingTime')
      .leftJoin('booking.bookingChildren', 'bookingChildren')
      .select([
        'booking.id',
        'booking.createdAt',
        'bookingTime.startTime',
        'bookingTime.endTime',
        'bookingTime.hasBreakTime',
        'bookingChildren.dob',
        'bookingChildren.gender',
      ])
      .where('booking.babysitterId = :babysitterId', { babysitterId })
      .andWhere('booking.parentId = :parentId', { parentId })
      .andWhere('booking.status = :status', {
        status: EBookingStatus.CONFIRMED,
      })
      .orderBy('booking.createdAt', 'ASC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    results.forEach((booking) => {
      booking.bookingChildren = this.calculateAgeOfChild(
        booking.bookingChildren,
      );
    });
    return { results, total };
  }
}
