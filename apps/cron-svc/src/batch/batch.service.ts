import { mutationResult } from '@lib/common/constants';
import { DbName } from '@lib/common/enums';
import { BatchConfig } from '@lib/core/databases/mongo/entities';
import { BatchLogEntity } from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { duration } from 'moment';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';

@Injectable()
export class BatchService extends BaseRepository {
  constructor(
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
  ) {
    super();
  }

  async getNotificationBatchLog(data) {
    const { limit, page } = data;
    const [batchLog, batchConfig] = await Promise.all([
      this.getPagination(
        this.postgresData,
        BatchLogEntity,
        {
          page,
          size: limit,
        },
        {
          order: {
            executedAt: 'DESC',
          },
        },
      ),
      this.getOne(this.mongoData, BatchConfig, {}),
    ]);
    return Object.assign(batchLog, { duration: batchConfig.duration });
  }

  async updateNotificationBatchConfig(data) {
    const { duration } = data;
    await this.update(this.mongoData, BatchConfig, {}, { duration });
    return mutationResult;
  }

  async getUserBatchLog(data) {
    const { id } = data;
  }
}
