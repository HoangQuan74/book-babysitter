import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
