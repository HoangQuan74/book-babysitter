import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { DbName } from '@lib/common/enums';
import { AwsClientModule } from '@lib/utils/aws-client/aws-client.module';
import { FirebaseModule, FirebaseService } from '@lib/utils/firebase';
const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};

@Module({
  imports: [AwsClientModule, ...mapEntities(entities)],
  controllers: [MarketingController],
  providers: [MarketingService],
})
export class MarketingModule {}
