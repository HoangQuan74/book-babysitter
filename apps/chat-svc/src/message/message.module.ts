import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { mapEntities } from '@lib/core/databases';
import { DbName } from '@lib/common/enums';
import {
  ConversationMessage,
  ConversationMessageSchema,
} from '@lib/core/databases/mongo/entities';

const entities = {
  [DbName.Mongo]: [
    { name: ConversationMessage.name, schema: ConversationMessageSchema },
  ],
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
