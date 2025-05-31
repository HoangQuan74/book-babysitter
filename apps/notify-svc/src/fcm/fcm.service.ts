import { mutationResult } from '@lib/common/constants';
import { DbName } from '@lib/common/enums';
import { UserDeviceEntity } from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { FirebaseService } from '@lib/utils/firebase';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class FcmService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    private readonly firebase: FirebaseService,
  ) {
    super();
  }

  async pushAppNotification(data) {
    const { userId, notification, params } = data;
    const userFcmToken = await this.getOne(
      this.postgresData,
      UserDeviceEntity,
      {
        where: { userId },
        order: {
          createdAt: 'DESC',
        },
      },
    );

    if (!userFcmToken) return mutationResult;

    this.firebase.sendFCM(userFcmToken.fcmToken, notification, params);
    return mutationResult;
  }
}
