import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '../configs';
import { MessageBuilder } from './message-builder.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
  ],
  providers: [MessageBuilder],
  exports: [MessageBuilder],
})
export class MessageBuilderModule {}
