import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { MessageModule } from '../message/message.module';
const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};

@Module({
  imports: [...mapEntities(entities), MessageModule],
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}
