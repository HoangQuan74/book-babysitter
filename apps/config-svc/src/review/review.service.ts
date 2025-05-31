import { DbName } from '@lib/common/enums';
import { ReviewEntity } from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';

@Injectable()
export class ReviewService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async getReviews() {
    return await this.getMany(this.postgresData, ReviewEntity, {});
  }
}
