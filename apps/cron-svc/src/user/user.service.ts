import { DbName, EService, EUserRole } from '@lib/common/enums';
import {
  UserEntity,
} from '@lib/core/databases/postgres/entities';
import { MessageBuilder } from '@lib/core/message-builder';
import { BaseRepository } from '@lib/core/repository';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource, In } from 'typeorm';

@Injectable()
export class UserService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,

    private readonly messageBuilder: MessageBuilder,
  ) {
    super();
  }

  async hardDeleteUser() {
    const users = await this.getRepository(this.postgresData, UserEntity)
      .createQueryBuilder('user')
      .select(['user.id'])
      .withDeleted()
      .where('user.role IN (:...role)', {
        role: [EUserRole.BABY_SITTER, EUserRole.PARENT],
      })
      .andWhere('user.deletedAt IS NOT NULL')
      .andWhere('user.deletedAt < :thresholdDate', {
        thresholdDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
      })
      .getMany();

    const userIds = users.map((user) => user.id);

    return this.messageBuilder.sendMessage(
      EService.AUTH,
      { userIds },
      { cmd: 'hardDeleteUserByIds' },
    );
  }
}
