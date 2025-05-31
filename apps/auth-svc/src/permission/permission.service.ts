import { errorMessage } from '@lib/common/constants';
import { DbName } from '@lib/common/enums';
import { IPermission } from '@lib/common/interfaces';
import {
  PermissionEntity,
  UserPermissionEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource, In } from 'typeorm';

@Injectable()
export class PermissionService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async validatePermission(permissionIds: string[]) {
    if (!permissionIds) {
      return;
    }

    const count = await this.count(this.postgresData, PermissionEntity, {
      where: { id: In(permissionIds) },
    });
    if (count !== permissionIds.length) {
      throw new BadRequestException(errorMessage.BAD_REQUEST);
    }
  }
  async hasPermission({ userId, permissionName }: IPermission) {
    const userPermission = await this.getOne(
      this.postgresData,
      UserPermissionEntity,
      {
        select: {
          id: true,
          user: {
            id: true,
            userRole: {
              hasAdminPermission: true,
              revokedAt: true,
            },
          },
        },
        where: { userId: userId, permission: { code: permissionName } },
        relations: ['user', 'user.userRole'],
      },
    );

    if (!userPermission) {
      return false;
    }

    if (!userPermission.user?.userRole.hasAdminPermission) {
      return false;
    }

    if (userPermission.user?.userRole.revokedAt < new Date()) {
      return false;
    }

    return true;
  }
}
