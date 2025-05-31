import {
  DbName,
  EBookingStatus,
  ELanguage,
  EService,
  ETypeNotify,
  EUserRole,
} from '@lib/common/enums';
import {
  BookingEntity,
  BookingTimeEntity,
  ENotificationBackgroundType,
  NotificationBackgroundEntity,
} from '@lib/core/databases/postgres/entities';
import { MessageBuilder } from '@lib/core/message-builder';
import { BaseRepository } from '@lib/core/repository';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource, In } from 'typeorm';

@Injectable()
export class BookingService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,

    private readonly messageBuilder: MessageBuilder,
  ) {
    super();
  }

  async sendNotification(
    bookings: BookingEntity[],
    notificationTypes: {
      babysitter?: ENotificationBackgroundType;
      parent?: ENotificationBackgroundType;
    },
  ) {
    const notifications = await Promise.all(
      Object.entries(notificationTypes).map(([role, type]) => {
        if (type) {
          return this.getOne(this.postgresData, NotificationBackgroundEntity, {
            where: { type },
          }).then((notification) => ({ role, notification }));
        }
        return null;
      }),
    );

    const notificationMap = notifications.reduce(
      (acc, item) => {
        if (item) acc[item.role] = item.notification;
        return acc;
      },
      {} as {
        babysitter?: NotificationBackgroundEntity;
        parent?: NotificationBackgroundEntity;
      },
    );

    bookings.forEach((booking) => {
      if (booking.babysitter && notificationMap.babysitter) {
        const lang = booking.babysitter.language.languageCode ?? ELanguage.vi;
        this.sendNotify({
          userId: booking.babysitter.id,
          notification: notificationMap.babysitter,
          lang: lang as ELanguage,
          bookingId: booking.id,
        });
      }

      if (booking.parent && notificationMap.parent) {
        const lang = booking.parent.language.languageCode ?? ELanguage.vi;
        this.sendNotify({
          userId: booking.parent.id,
          notification: notificationMap.parent,
          lang: lang as ELanguage,
          bookingId: booking.id,
        });
      }
    });
  }

  async sendNotify(payload: {
    userId: string;
    notification: NotificationBackgroundEntity;
    lang: ELanguage;
    bookingId: string;
  }) {
    const { userId, notification, lang, bookingId } = payload;
    this.messageBuilder.sendMessage(
      EService.NOTIFY,
      {
        userId: userId,
        notification: {
          title: notification.title[lang],
          body: notification.content[lang],
        },
        params: {
          bookingId: bookingId,
          type: ETypeNotify.BOOKING,
        },
      },
      { cmd: 'pushAppNotification' },
    );
  }

  async getReminderBooking(
    timeRemain: number,
    receiver: EUserRole[] = [EUserRole.BABY_SITTER],
    status: EBookingStatus = EBookingStatus.PENDING,
  ) {
    const queryBuilder = this.getRepository(this.postgresData, BookingEntity)
      .createQueryBuilder('booking')
      .innerJoin('booking.bookingTimes', 'bookingTime')
      .where('booking.status = :status', { status: status })
      .addSelect(['bookingTime.startTime']);

    if (receiver.includes(EUserRole.BABY_SITTER)) {
      queryBuilder
        .innerJoin('booking.babysitter', 'babysitter')
        .leftJoin('babysitter.language', 'languageBabysitter')
        .addSelect(['babysitter.id', 'languageBabysitter.languageCode']);
    }

    if (receiver.includes(EUserRole.PARENT)) {
      queryBuilder
        .innerJoin('booking.parent', 'parent')
        .leftJoin('parent.language', 'languageParent')
        .addSelect(['parent.id', 'languageParent.languageCode']);
    }

    const booking = await queryBuilder.getMany();
    const data = booking.filter(
      (booking) =>
        booking.remainingTime > (timeRemain - 1) * 60 * 60 &&
        booking.remainingTime <= timeRemain * 60 * 60,
    );

    return data;
  }

  async updateBookingRejectAfter48Hours(bookingIds: string[]) {
    await this.update(
      this.postgresData,
      BookingEntity,
      { id: In(bookingIds), status: EBookingStatus.PENDING },
      { status: EBookingStatus.BABY_SITTER_CANCEL, isReject: false },
    );
  }

  async updateStatusBookingComplete() {
    const bookings = await this.getRepository(this.postgresData, BookingEntity)
      .createQueryBuilder('booking')
      .select(['booking.id', 'booking.createdAt', 'booking.status'])
      .where('booking.status = :status', { status: EBookingStatus.CONFIRMED })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from(BookingTimeEntity, 'bookingTime')
          .where('bookingTime.bookingId = booking.id')
          .andWhere('bookingTime.endTime > now()')
          .getQuery();
        return `NOT EXISTS(${subQuery})`;
      })
      .getMany();

    const bookingIds = bookings.map((booking) => booking.id);
    await this.update(
      this.postgresData,
      BookingEntity,
      { id: In(bookingIds) },
      { status: EBookingStatus.COMPLETED },
    );

    return true;
  }
}
