import { Module } from '@nestjs/common';
import { UserImageService } from './user-image.service';
import { UserImageController } from './user-image.controller';

@Module({
  controllers: [UserImageController],
  providers: [UserImageService],
})
export class UserImageModule {}
