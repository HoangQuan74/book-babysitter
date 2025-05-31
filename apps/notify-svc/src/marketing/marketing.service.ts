import { NotificationType } from '@aws-sdk/client-ses';
import { mutationResult } from '@lib/common/constants';
import { DbName } from '@lib/common/enums';
import {
  ENotificationChannel,
  NotificationAlarmEntity,
  NotificationEntity,
  PushNotificationEntity,
} from '@lib/core/databases/postgres/entities';
import { NotificationPushTypeEntity } from '@lib/core/databases/postgres/entities/notification-push-type.entity';
import { BaseRepository } from '@lib/core/repository';
import { AwsClientService } from '@lib/utils/aws-client/aws-client.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { isEmpty } from 'class-validator';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';

@Injectable()
export class MarketingService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    private readonly awsClientService: AwsClientService,
  ) {
    super();
  }
  async createEmailMarketing(data) {
    const { title, content, targetReceiver, sendTime } = data;
    const notification = await this.create(
      this.postgresData,
      NotificationEntity,
      {
        title,
        content,
        targetReceiver,
        sendTime,
        channel: ENotificationChannel.EMAIL,
      },
    );
    return notification;
  }

  async getListNotification(data) {
    const { channel, status, page, limit } = data;
    const where = {};
    if (channel) {
      Object.assign(where, { channel });
    }
    if (status) {
      Object.assign(where, { status });
    }
    return this.getPagination(
      this.postgresData,
      NotificationEntity,
      { page, size: limit },
      {
        where: where,
        order: { createdAt: 'DESC' },
      },
    );
  }
  async getNotificationDetail(data) {
    const { id } = data;
    const notification = await this.getOne(
      this.postgresData,
      NotificationEntity,
      {
        where: {
          id,
        },
      },
    );
    const pushDetail = await this.getOne(
      this.postgresData,
      PushNotificationEntity,
      {
        where: {
          notificationId: notification.id,
        },
      },
    );
    return Object.assign(notification, pushDetail);
  }

  async getAlarmNotification(data) {
    const { target } = data;
    return this.getMany(this.postgresData, NotificationAlarmEntity, {
      where: { target },
      order: { createdAt: 'DESC' },
    });
  }
  async updateAlarmNotification(data) {
    const { id, body } = data;
    const { content } = body;
    try {
      await this.update(
        this.postgresData,
        NotificationAlarmEntity,
        { id },
        { content },
      );
      return mutationResult;
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async getPushType(data) {
    const { languageCode } = data;
    return await this.getRepository(
      this.postgresData,
      NotificationPushTypeEntity,
    )
      .createQueryBuilder('type')
      .select(['type.id AS id', `type.name->'${languageCode}' AS name`])
      .getRawMany();
  }

  async createPushNotification(data) {
    try {
      const {
        title,
        content,
        targetReceiver,
        sendTime,
        file,
        isAndroidApplied,
        isIosApplied,
        pushTypeId,
      } = data;
      const presignedUrl = '';
      if (file) {
        const presignedUrl = await this.awsClientService.createS3PresignedUrl(
          file.key,
        );
        Object.assign(file, {
          url: presignedUrl.split('?')[0],
          id: randomUUID(),
        });
      }

      const notification = await this.create(
        this.postgresData,
        NotificationEntity,
        {
          title,
          content,
          targetReceiver,
          sendTime,
          channel: ENotificationChannel.PUSH,
          file,
        },
      );
      const push = await this.create(
        this.postgresData,
        PushNotificationEntity,
        {
          notificationId: notification.id,
          isAndroidApplied,
          isIosApplied,
          pushTypeId,
        },
      );
      if (!isEmpty(sendTime)) {
        // const userFcmToken = await this.getOne(
        //   this.postgresData,
        //   UserDeviceEntity,
        //   {
        //     where: { userId, isActive: true },
        //   },
        // );
        // this.firebase.sendFCM(userFcmToken.fcmToken, payload);
      }
      return Object.assign(notification, { presignedUrl });
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }
}
