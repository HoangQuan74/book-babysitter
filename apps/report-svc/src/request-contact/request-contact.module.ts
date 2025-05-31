import { Module } from '@nestjs/common';
import { RequestContactService } from './request-contact.service';
import { RequestContactController } from './request-contact.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [RequestContactController],
  providers: [RequestContactService],
  exports: [RequestContactService],
})
export class RequestContactModule {}
