import { Module } from '@nestjs/common';
import { NotificationBackgroundService } from './notification-background.service';
import { NotificationBackgroundController } from './notification-background.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [NotificationBackgroundController],
  providers: [NotificationBackgroundService],
})
export class NotificationBackgroundModule {}
