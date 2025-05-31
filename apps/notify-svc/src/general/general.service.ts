import { mutationResult } from '@lib/common/constants';
import { DbName } from '@lib/common/enums';
import { GeneralNotificationEntity } from '@lib/core/databases/postgres/entities';
import { GeneralNotificationViewEntity } from '@lib/core/databases/postgres/entities/notification-general-view.entity';
import { BaseRepository } from '@lib/core/repository';
import { formatKey } from '@lib/utils';
import { AwsClientService } from '@lib/utils/aws-client';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';

@Injectable()
export class GeneralService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    private readonly awsClientService: AwsClientService,
  ) {
    super();
  }
  async createGeneralNotification(data) {
    try {
      const { user } = data;
      const { files, ...rest } = data.body;
      const images = [];
      await Promise.all(
        files.map(async (file) => {
          const key = formatKey(user, file.key);
          const url = await this.awsClientService.createS3PresignedUrl(key);
          images.push({ id: randomUUID(), ...file, url: url.split('?')[0] });
          file.url = url;
        }),
      );
      const notification = await this.create(
        this.postgresData,
        GeneralNotificationEntity,
        {
          files: images,
          ...rest,
        },
      );
      return Object.assign(notification, { files });
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async getGeneralNotificationDetail(data) {
    const { id } = data;
    const { user } = data;
    if (user) {
      await this.upsert(
        this.postgresData,
        GeneralNotificationViewEntity,
        {
          userId: user.userId,
          generalNotificationId: id,
        },
        { userId: user.userId, generalNotificationId: id },
      );
    }
    return this.getOne(this.postgresData, GeneralNotificationEntity, {
      where: {
        id: id,
      },
    });
  }

  async updateGeneralNotificationDetail(data) {
    const { id, body } = data;
    await this.update(
      this.postgresData,
      GeneralNotificationEntity,
      { id },
      { ...body },
    );
    return mutationResult;
  }

  async getGeneralNotification(data) {
    const { limit, page, isVisible, targetReceiver, languageCode, user } = data;
    const where = {};
    if (typeof isVisible === 'boolean') {
      Object.assign(where, { isVisible: isVisible });
    }
    if (targetReceiver) {
      Object.assign(where, { targetReceiver });
    }
    if (languageCode) {
      Object.assign(where, { languageCode });
    }
    const res = await this.getPagination(
      this.postgresData,
      GeneralNotificationEntity,
      { page, size: limit },
      {
        where,
      },
    );
    if (user) {
      const results = await Promise.all(
        res.results.map(async (item) => {
          const isViewed = await this.exist(
            this.postgresData,
            GeneralNotificationViewEntity,
            {
              where: {
                userId: user.id,
                generalNotificationId: item.id,
              },
            },
          );
          return {
            ...item,
            isViewed,
          };
        }),
      );
      Object.assign(res, { results });
    }
    return res;
  }
}
