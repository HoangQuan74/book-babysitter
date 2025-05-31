import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { MessageBuilderModule } from '@lib/core/message-builder';
import { SessionModule } from '../session/session.module';
import { AwsClientModule } from '@lib/utils/aws-client/aws-client.module';
import { PermissionModule } from '../permission/permission.module';
import { ResourceModule } from '../resource/resource.module';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};

@Module({
  imports: [
    MessageBuilderModule,
    ...mapEntities(entities),
    SessionModule,
    AwsClientModule,
    PermissionModule,
    ResourceModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
