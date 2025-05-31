import { Module } from '@nestjs/common';
import { UserImageService } from './user-image.service';
import { UserImageController } from './user-image.controller';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { DbName } from '@lib/common/enums';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [UserImageController],
  providers: [UserImageService],
  exports: [UserImageService],
})
export class UserImageModule {}
