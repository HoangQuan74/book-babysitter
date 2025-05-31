import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { MessageBuilderModule } from '@lib/core/message-builder';
import { NotificationModule } from '../notification/notification.module';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};

@Module({
  imports: [MessageBuilderModule, ...mapEntities(entities), NotificationModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
