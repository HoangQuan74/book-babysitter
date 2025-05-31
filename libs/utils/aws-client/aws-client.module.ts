import { Module } from '@nestjs/common';
import { AwsClientService } from './aws-client.service';
import { configuration } from '@lib/core/configs';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
  ],
  providers: [AwsClientService],
  exports: [AwsClientService],
})
export class AwsClientModule {}
