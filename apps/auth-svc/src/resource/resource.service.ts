import { DbName, EUserRole } from '@lib/common/enums';
import {
  ResourceEntity,
  RolePermissionEntity,
  UserPermissionEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource, JsonContains } from 'typeorm';

@Injectable()
export class ResourceService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async getResources(lang: string, userId?: string): Promise<ResourceEntity[]> {
    const { entities, raw } = await this.getRepository(
      this.postgresData,
      ResourceEntity,
    )
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.permissions', 'permission')
      .select([
        'resource.id',
        'resource.order',
        `resource.name::jsonb->>:lang as resource_name`,
        'permission.id',
        'permission.code',
        'permission.order',
        `permission.name::jsonb->>:lang as permission_name`,
      ])
      .setParameter('lang', lang)
      .orderBy('resource.order', 'ASC')
      .addOrderBy('permission.order', 'ASC')
      .getRawAndEntities();

    const userPermissions = await this.getPermissions(userId);

    const rawResourceMap = this.mapRawResources(raw);

    entities.forEach((resource) => {
      const rawResource = rawResourceMap[resource.id];
      if (rawResource) {
        resource.name = rawResource.resource_name;
      }

      resource.permissions.forEach((permission) => {
        const rawPermission = rawResourceMap[permission.id];
        if (rawPermission) {
          permission.name = rawPermission.permission_name;
        }

        permission.active = userPermissions.includes(permission.id);
      });
    });

    return entities;
  }

  private mapRawResources(rawData: any[]): Record<string, any> {
    return rawData.reduce((acc, item) => {
      acc[item.resource_id] = item;
      acc[item.permission_id] = item;
      return acc;
    }, {});
  }

  async getPermissions(userId?: string): Promise<string[]> {
    if (userId) {
      const permissions = await this.getMany(
        this.postgresData,
        UserPermissionEntity,
        {
          select: ['permissionId'],
          where: { userId: userId },
        },
      );
      return permissions.map((item) => item.permissionId);
    }

    const defaultPermissions = await this.getMany(
      this.postgresData,
      RolePermissionEntity,
      {
        select: ['permissionId'],
        where: { role: { name: EUserRole.MANAGER } },
      },
    );

    return defaultPermissions.map((item) => item.permissionId);
  }
}
