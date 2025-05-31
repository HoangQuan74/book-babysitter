import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { getEntitiesPostgres, mapEntities } from '@lib/core/databases';
import { DbName } from '@lib/common/enums';
import { AwsClientModule } from '@lib/utils/aws-client/aws-client.module';
const entities = {
  [DbName.Postgres]: getEntitiesPostgres(),
};

@Module({
  imports: [AwsClientModule, ...mapEntities(entities)],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
