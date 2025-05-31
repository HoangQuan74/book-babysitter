import { DbName } from '@lib/common/enums';
import { UserDeviceEntity } from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DeviceService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
  ) {
    super();
  }

  createUserDevice(data) {
    const { deviceId, fcmToken, platform, metadata } = data.body;
    return this.create(this.postgresData, UserDeviceEntity, {
      userId: data.user.userId,
      fcmToken,
      deviceId,
      platform,
      metadata,
    });
  }
}
