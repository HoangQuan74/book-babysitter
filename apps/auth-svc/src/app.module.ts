import { configuration } from '@lib/core/configs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionModule } from './session/session.module';
import { dbConfig } from '@lib/common/constants';
import { DatabaseModule } from '@lib/core/databases';
import { AccountModule } from './account/account.module';
import { ResourceModule } from './resource/resource.module';
import { PermissionModule } from './permission/permission.module';
import { DeviceModule } from './device/device.module';
import { UserImageModule } from './user-image/user-image.module';
import { BabysitterRankingModule } from './babysitter-ranking/babysitter-ranking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ...DatabaseModule.register({
      dbConfig,
      getConfig: (cf) => (configService: ConfigService) => {
        const schemaDbConfig = configService.get(cf);
        return Object.assign(
          {},
          schemaDbConfig,
          schemaDbConfig?.replication?.master,
        );
      },
    }),
    SessionModule,
    AccountModule,
    ResourceModule,
    PermissionModule,
    DeviceModule,
    UserImageModule,
    BabysitterRankingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
