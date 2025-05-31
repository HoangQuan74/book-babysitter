import { Module } from '@nestjs/common';
import { RatingController } from './rating.controller';
import { SocketClientModule } from '../socket-client/socket-client.module';

@Module({
  imports: [SocketClientModule],
  controllers: [RatingController],
})
export class RatingModule {}
