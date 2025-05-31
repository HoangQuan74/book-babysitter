import { DbName, ELanguage, ETypeNotify } from '@lib/common/enums';
import {
  ENotificationBackgroundType,
  LanguageEntity,
  NotificationBackgroundEntity,
  UserEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';
import { FcmService } from '../fcm/fcm.service';

@Injectable()
export class ChatService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,

    private readonly fcmService: FcmService,
  ) {
    super();
  }

  async sendNotificationMessage(receiver: string, sender: string) {
    const notify = await this.getOne(
      this.postgresData,
      NotificationBackgroundEntity,
      {
        where: { type: ENotificationBackgroundType.CHAT_MESSAGE },
      },
    );

    const receiverLanguage = await this.getOne(this.postgresData, UserEntity, {
      where: { id: receiver },
      relations: { language: true },
      select: {
        id: true,
        language: {
          languageCode: true,
        },
      },
    });

    const lang = receiverLanguage?.language?.languageCode ?? ELanguage.vi;

    await this.fcmService.pushAppNotification({
      userId: receiver,
      notification: { title: notify.title[lang], body: notify.content[lang] },
      params: {
        sender,
        type: ETypeNotify.CHAT,
      },
    });
    return true;
  }
}
