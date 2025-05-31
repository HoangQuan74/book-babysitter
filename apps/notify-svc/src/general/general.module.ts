import { Module } from '@nestjs/common';
import { GeneralService } from './general.service';
import { GeneralController } from './general.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { AwsClientModule } from '@lib/utils/aws-client';
const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [AwsClientModule, ...mapEntities(entities)],
  controllers: [GeneralController],
  providers: [GeneralService],
})
export class GeneralModule {}
