import { Module } from '@nestjs/common';
import { RatingUserService } from './rating-user.service';
import { RatingUserController } from './rating-user.controller';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { DbName } from '@lib/common/enums';
import { AwsClientModule } from '@lib/utils/aws-client';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities), AwsClientModule],
  controllers: [RatingUserController],
  providers: [RatingUserService],
})
export class RatingUserModule {}
