import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { FcmModule } from '../fcm/fcm.module';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities), FcmModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
