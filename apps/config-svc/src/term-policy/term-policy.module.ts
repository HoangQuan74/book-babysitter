import { Module } from '@nestjs/common';
import { TermPolicyService } from './term-policy.service';
import { TermPolicyController } from './term-policy.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};

@Module({
  imports: [...mapEntities(entities)],
  controllers: [TermPolicyController],
  providers: [TermPolicyService],
  exports: [TermPolicyService],
})
export class TermPolicyModule {}
