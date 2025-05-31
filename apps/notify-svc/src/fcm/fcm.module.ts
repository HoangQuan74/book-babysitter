import { Module } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { FcmController } from './fcm.controller';
import { FirebaseModule } from '@lib/utils/firebase';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [FirebaseModule],
  controllers: [FcmController],
  exports: [FcmService],
  providers: [FcmService],
})
export class FcmModule {}
