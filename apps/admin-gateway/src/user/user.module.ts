import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { MessageBuilderModule } from '@lib/core/message-builder';

@Module({
  imports: [MessageBuilderModule],
  controllers: [UserController],
})
export class UserModule {}
