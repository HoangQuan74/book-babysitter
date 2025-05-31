import { Module } from '@nestjs/common';
import { IntroductionBannerService } from './introduction-banner.service';
import { IntroductionBannerController } from './introduction-banner.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { AwsClientModule } from '@lib/utils/aws-client/aws-client.module';
const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities), AwsClientModule],
  controllers: [IntroductionBannerController],
  providers: [IntroductionBannerService],
})
export class IntroductionBannerModule {}
