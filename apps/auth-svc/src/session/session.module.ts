import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { MessageBuilderModule } from '@lib/core/message-builder';
import { AwsClientModule } from '@lib/utils/aws-client/aws-client.module';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};

@Module({
  imports: [MessageBuilderModule, ...mapEntities(entities), AwsClientModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
