import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { DbName } from '@lib/common/enums';
import {
  BatchConfig,
  BatchConfigSchema,
} from '@lib/core/databases/mongo/entities';
const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
  [DbName.Mongo]: [{ name: BatchConfig.name, schema: BatchConfigSchema }],
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [BatchController],
  providers: [BatchService],
})
export class BatchModule {}
