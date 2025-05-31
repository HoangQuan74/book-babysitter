import {
  DbName,
  EBookingStatus,
  ELanguage,
  EService,
  ETypeNotify,
  EUserRole,
} from '@lib/common/enums';
import {
  BookingChildrenEntity,
  BookingEntity,
  BookingTimeEntity,
  CityEntity,
  ConversationEntity,
  CurrencyEntity,
  ENotificationAlarmType,
  ENotificationBackgroundType,
  NotificationAlarmEntity,
  NotificationBackgroundEntity,
  UserEntity,
} from '@lib/core/databases/postgres/entities';
import { MessageBuilder } from '@lib/core/message-builder';
import { BaseRepository } from '@lib/core/repository';
import {
  createMessageBooking,
  createMessageForRejectBooking,
} from '@lib/utils/helpers';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';
import { isEmpty } from 'lodash';

@Injectable()
export class NotificationService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,

    private readonly messageBuilder: MessageBuilder,
  ) {
    super();
  }

  async createMessage(
    booking: BookingEntity,
    status: EBookingStatus,
    isReject: boolean = false,
  ) {
    let message = [];
    let notifyAlarm = [];
    if (isEmpty(booking.bookingTimes)) {
      booking.bookingTimes = await this.getMany(
        this.postgresData,
        BookingTimeEntity,
        {
          where: { bookingId: booking.id },
          select: {
            startTime: true,
            endTime: true,
            hasBreakTime: true,
          },
        },
      );
    }

    if (isEmpty(booking.bookingChildren)) {
      booking.bookingChildren = await this.getMany(
        this.postgresData,
        BookingChildrenEntity,
        {
          where: {
            bookingId: booking.id,
          },
          select: {
            dob: true,
            gender: true,
          },
        },
      );
    }

    if (isEmpty(booking.currency)) {
      booking.currency = await this.getOne(this.postgresData, CurrencyEntity, {
        where: { id: booking.currencyId },
        select: { unit: true },
      });
    }

    if (isEmpty(booking.city)) {
      booking.city = await this.getOne(this.postgresData, CityEntity, {
        where: { id: booking.cityId },
        select: { name: true },
      });
    }

    switch (status) {
      case EBookingStatus.PENDING:
        notifyAlarm = await this.getMany(
          this.postgresData,
          NotificationAlarmEntity,
          {
            where: { type: ENotificationAlarmType.REQUEST_CONFIRM },
            order: { target: 'DESC' },
          },
        );
        message[0] = createMessageBooking(
          booking,
          notifyAlarm[0],
          ELanguage.ko,
        );
        message[1] = createMessageBooking(
          booking,
          notifyAlarm[1],
          ELanguage.vi,
        );
        break;
      case EBookingStatus.CONFIRMED:
        notifyAlarm = await this.getMany(
          this.postgresData,
          NotificationAlarmEntity,
          {
            where: { type: ENotificationAlarmType.CONFIRMED_BOOKING },
            order: { target: 'DESC' },
          },
        );
        message[0] = createMessageBooking(
          booking,
          notifyAlarm[0],
          ELanguage.ko,
        );
        message[1] = createMessageBooking(
          booking,
          notifyAlarm[1],
          ELanguage.vi,
        );
        break;
      case EBookingStatus.BABY_SITTER_CANCEL:
      case EBookingStatus.PARENT_CANCEL:
        if (isReject) {
          notifyAlarm = await this.getMany(
            this.postgresData,
            NotificationAlarmEntity,
            {
              where: { type: ENotificationAlarmType.REJECT_BOOKING },
              order: { target: 'DESC' },
            },
          );
          message[0] = createMessageForRejectBooking(
            booking,
            notifyAlarm[0],
            ELanguage.ko,
          );
          message[1] = createMessageForRejectBooking(
            booking,
            notifyAlarm[1],
            ELanguage.vi,
          );
        } else {
          notifyAlarm = await this.getMany(
            this.postgresData,
            NotificationAlarmEntity,
            {
              where: { type: ENotificationAlarmType.CANCEL_BOOKING },
              order: { target: 'DESC' },
            },
          );
          message[0] = createMessageBooking(
            booking,
            notifyAlarm[0],
            ELanguage.ko,
          );
          message[1] = createMessageBooking(
            booking,
            notifyAlarm[1],
            ELanguage.vi,
          );
        }
        break;
    }

    const conversationParent = await this.getOne(
      this.postgresData,
      ConversationEntity,
      { where: { isAdmin: true, participants: { userId: booking.parentId } } },
    );

    const conversationBabysitter = await this.getOne(
      this.postgresData,
      ConversationEntity,
      {
        where: {
          isAdmin: true,
          participants: { userId: booking.babysitterId },
        },
      },
    );

    const admin = await this.getOne(this.postgresData, UserEntity, {
      where: { role: EUserRole.ADMIN },
      select: { id: true },
    });

    this.messageBuilder.sendMessage(
      EService.CHAT,
      {
        conversationId: conversationParent?.id,
        receiver: booking.parentId,
        sender: admin.id,
        content: message[0],
      },
      {
        cmd: NotificationService.prototype.createMessage.name,
      },
    );

    this.messageBuilder.sendMessage(
      EService.CHAT,
      {
        conversationId: conversationBabysitter?.id,
        receiver: booking.babysitterId,
        sender: admin.id,
        content: message[1],
      },
      {
        cmd: NotificationService.prototype.createMessage.name,
      },
    );
    return 0;
  }

  async createConversation(sender: string, receiver: string, message: string) {
    this.messageBuilder.sendMessage(
      EService.CHAT,
      {
        receiver,
        sender,
        content: message,
      },
      {
        cmd: NotificationService.prototype.createMessage.name,
      },
    );
  }

  async sendNotification(
    type: ENotificationBackgroundType,
    userId: string,
    bookingId: string,
  ) {
    const notification = await this.getOne(
      this.postgresData,
      NotificationBackgroundEntity,
      {
        where: { type: type },
      },
    );

    const receiverLanguage = await this.getOne(this.postgresData, UserEntity, {
      where: { id: userId },
      relations: { language: true },
      select: {
        id: true,
        language: {
          languageCode: true,
        },
      },
    });

    const lang = receiverLanguage?.language?.languageCode ?? ELanguage.vi;

    this.messageBuilder.sendMessage(
      EService.NOTIFY,
      {
        userId,
        notification: {
          title: notification.title[lang],
          body: notification.content[lang],
        },
        params: {
          bookingId,
          type: ETypeNotify.BOOKING,
        },
      },
      { cmd: 'pushAppNotification' },
    );
  }
}
