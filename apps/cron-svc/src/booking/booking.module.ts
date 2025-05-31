import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { MessageBuilderModule } from '@lib/core/message-builder';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};

@Module({
  imports: [MessageBuilderModule, ...mapEntities(entities)],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
