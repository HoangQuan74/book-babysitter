import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { MessageBuilderModule } from '@lib/core/message-builder';

@Module({
  imports: [MessageBuilderModule],
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {}
