import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MessageBuilderModule } from '@lib/core/message-builder/message-builder.module';
import { PassportModule } from '@nestjs/passport';
@Module({
  imports: [MessageBuilderModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
