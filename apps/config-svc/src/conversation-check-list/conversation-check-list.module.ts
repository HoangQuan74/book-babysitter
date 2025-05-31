import { Module } from '@nestjs/common';
import { ConversationCheckListService } from './conversation-check-list.service';
import { ConversationCheckListController } from './conversation-check-list.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [ConversationCheckListController],
  providers: [ConversationCheckListService],
})
export class ConversationCheckListModule {}
