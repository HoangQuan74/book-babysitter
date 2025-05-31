import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { MessageBuilderModule } from '@lib/core/message-builder';
import { SocketClientModule } from '../socket-client/socket-client.module';

@Module({
  imports: [MessageBuilderModule, SocketClientModule],
  controllers: [BookingController],
})
export class BookingModule {}
