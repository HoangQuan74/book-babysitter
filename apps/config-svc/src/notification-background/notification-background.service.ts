import { errorMessage } from '@lib/common/constants';
import { DbName } from '@lib/common/enums';
import { INotificationBackground } from '@lib/common/interfaces';
import {
  ENotificationBackgroundType,
  NotificationBackgroundEntity,
} from '@lib/core/databases/postgres/entities/notification-background.entity';
import { BaseRepository } from '@lib/core/repository';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';

@Injectable()
export class NotificationBackgroundService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async getNotificationBackground(type: ENotificationBackgroundType) {
    return await this.getOne(this.postgresData, NotificationBackgroundEntity, {
      where: { type },
    });
  }

  async createNotificationBackground(data: INotificationBackground) {
    return this.update(
      this.postgresData,
      NotificationBackgroundEntity,
      {
        type: data.type,
      },
      {
        type: data.type,
        title: data.title,
        content: data.content,
        isDisable: data.isDisable,
      },
    );
  }
}
