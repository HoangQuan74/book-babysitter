import { errorMessage } from '@lib/common/constants';
import { DbName } from '@lib/common/enums';
import { IQuery, IRequestUser } from '@lib/common/interfaces';
import { PostCommentEntity } from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { isEmpty } from 'lodash';
import { Connection } from 'mongoose';
import { DataSource, In, IsNull } from 'typeorm';
@Injectable()
export class PostCommentService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async getCommentByPostId(query: any) {
    const { postId, limit, page } = query;

    const queryBuilder = this.getQueryBuilderComment();
    const queryBuilderChild = queryBuilder.clone();

    const [rootComments, total] = await queryBuilder
      .orderBy('comment.createdAt', 'ASC')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.commentParentId IS NULL')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    if (isEmpty(rootComments)) {
      return {
        results: [],
        total: 0,
      };
    }

    const rootCommentIds = rootComments.map((comment) => comment.id);

    const childComments = await queryBuilderChild
      .andWhere('comment.commentRootId IN (:...rootCommentIds)', {
        rootCommentIds,
      })
      .orderBy('comment.createdAt', 'ASC')
      .getMany();

    const commentMap = new Map();

    for (const rootComment of rootComments) {
      commentMap.set(rootComment.id, { ...rootComment, children: [] });
    }

    for (const childComment of childComments) {
      const parentComment = commentMap.get(childComment.commentRootId);
      if (parentComment) {
        parentComment.children.push(childComment);
      }
    }

    return {
      results: Array.from(commentMap.values()),
      total,
    };
  }

  getQueryBuilderComment() {
    return this.getRepository(this.postgresData, PostCommentEntity)
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .leftJoin('comment.taggedUser', 'taggedUser')
      .leftJoinAndMapOne(
        'user.avatar',
        'user.userImages',
        'avatar',
        'avatar.order = 0',
      )
      .select([
        'comment.id',
        'comment.content',
        'comment.createdAt',
        'comment.userId',
        'comment.commentParentId',
        'comment.commentRootId',
        'user.id',
        'user.username',
        'user.role',
        'avatar.url',
        'taggedUser.id',
        'taggedUser.username',
      ]);
  }

  async getCommentById(commentId) {
    try {
      const queryBuilder = this.getQueryBuilderComment();
      const comment = await queryBuilder
        .where('comment.id = :commentId', { commentId })
        .getOne();

      if (!comment) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      const queryBuilderChild = this.getQueryBuilderComment();
      const childComments = await queryBuilderChild
        .andWhere('comment.commentRootId = :commentRootId', {
          commentRootId: comment.id,
        })
        .orderBy('comment.createdAt', 'ASC')
        .getMany();
      return { ...comment, children: childComments };
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async getMyCommentsOnPosts(reqUser: IRequestUser, query: IQuery) {
    const { limit, page } = query;
    const queryBuilder = this.getRepository(
      this.postgresData,
      PostCommentEntity,
    )
      .createQueryBuilder('comment')
      .leftJoin('comment.taggedUser', 'taggedUser')
      .innerJoin('comment.post', 'post')
      .innerJoin('post.owner', 'owner')
      .leftJoinAndMapOne(
        'owner.avatar',
        'owner.userImages',
        'avatar',
        'avatar.order = 0',
      )
      .leftJoin('post.country', 'country')
      .leftJoin('post.city', 'city')
      .leftJoin('post.type', 'type')
      .leftJoin('post.category', 'category')
      .loadRelationCountAndMap('post.countComment', 'post.comment')
      .where('comment.userId = :userId', { userId: reqUser.userId })
      .select([
        'comment.id',
        'comment.content',
        'comment.createdAt',
        'taggedUser.id',
        'taggedUser.username',
        'post.id',
        'post.title',
        'post.content',
        'post.files',
        'post.createdAt',
        'post.countView',
        'owner.id',
        'owner.username',
        'avatar.url',
        'city.id',
        'city.name',
        'country.id',
        'country.name',
        'type.id',
        'type.name',
        'category.id',
        'category.name',
      ]);

    const [results, total] = await queryBuilder
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { results, total };
  }
}
