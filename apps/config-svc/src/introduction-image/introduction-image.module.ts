import { Module } from '@nestjs/common';
import { IntroductionImageService } from './introduction-image.service';
import { IntroductionImageController } from './introduction-image.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { AwsClientModule } from '@lib/utils/aws-client/aws-client.module';
const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities), AwsClientModule],
  controllers: [IntroductionImageController],
  providers: [IntroductionImageService],
})
export class IntroductionImageModule {}
