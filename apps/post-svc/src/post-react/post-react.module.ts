import { Module } from '@nestjs/common';
import { PostReactService } from './post-react.service';
import { PostReactController } from './post-react.controller';
import { DbName } from '@lib/common/enums';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';

const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};
@Module({
  imports: [...mapEntities(entities)],
  controllers: [PostReactController],
  providers: [PostReactService],
})
export class PostReactModule {}
