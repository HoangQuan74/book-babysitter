import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { AwsClientModule } from '@lib/utils/aws-client/aws-client.module';

@Module({
  imports: [AwsClientModule],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
