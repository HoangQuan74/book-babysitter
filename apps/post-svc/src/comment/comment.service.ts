import { DbName, EService, ETypePoint } from '@lib/common/enums';
import {
  PostCommentEntity,
  UserEntity,
} from '@lib/core/databases/postgres/entities';
import { MessageBuilder } from '@lib/core/message-builder';
import { BaseRepository } from '@lib/core/repository';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    private readonly messageBuilder: MessageBuilder,
  ) {
    super();
  }
  async createComment(data) {
    const { userId } = data.user;
    const { postId, taggedUserId, ...rest } = data.body;
    try {
      const comment = await this.create(this.postgresData, PostCommentEntity, {
        userId,
        postId,
        taggedUserId,
        ...rest,
      });

      comment.user = await this.getRepository(this.postgresData, UserEntity)
        .createQueryBuilder('user')
        .leftJoinAndMapOne(
          'user.avatar',
          'user.userImages',
          'avatar',
          'avatar.order = 0',
        )
        .where('user.id = :id', { id: userId })
        .select(['user.id', 'user.username', 'avatar.url'])
        .getOne();

      if (taggedUserId) {
        comment.taggedUser = await this.getOne(this.postgresData, UserEntity, {
          where: { id: taggedUserId },
          select: ['id', 'username', 'role'],
        });
      }

      this.messageBuilder.sendMessage(
        EService.POINT,
        { babysitterId: userId, type: ETypePoint.COMMENT },
        {
          cmd: 'addPoint',
        },
      );

      return comment;
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }
}
