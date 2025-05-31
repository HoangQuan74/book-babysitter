import { configuration } from '@lib/core/configs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostModule } from './post/post.module';
import { DatabaseModule } from '@lib/core/databases';
import { dbConfig } from '@lib/common/constants';
import { PostCommentModule } from './post-comment/post-comment.module';
import { CommentModule } from './comment/comment.module';
import { PostReactModule } from './post-react/post-react.module';
import { MessageBuilderModule } from '@lib/core/message-builder';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ...DatabaseModule.register({
      dbConfig,
      getConfig: (cf) => (configService: ConfigService) => {
        const schemaDbConfig = configService.get(cf);
        return Object.assign(
          {},
          schemaDbConfig,
          schemaDbConfig?.replication?.master,
        );
      },
    }),
    MessageBuilderModule,
    PostModule,
    PostCommentModule,
    CommentModule,
    PostReactModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
