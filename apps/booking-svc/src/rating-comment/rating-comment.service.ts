import { errorMessage } from '@lib/common/constants';
import { DbName } from '@lib/common/enums';
import { ICreateRatingComment, IRequestUser } from '@lib/common/interfaces';
import { RatingCommentEntity } from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';

@Injectable()
export class RatingCommentService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async createComment(reqUser: IRequestUser, data: ICreateRatingComment) {
    try {
      const { userId } = reqUser;
      const { parentId, content, id } = data;

      if (id) {
        await this.checkValidCommentId(id, userId);
        return await this.update(
          this.postgresData,
          RatingCommentEntity,
          { id: id },
          { content: content },
        );
      }

      if (parentId) {
        await this.checkValidCommentId(parentId);
      }

      return await this.create(this.postgresData, RatingCommentEntity, {
        userId: userId,
        parentId: parentId,
        content: content,
      });
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async checkValidCommentId(id: string, userId?: string) {
    const isValidComment = await this.exist(
      this.postgresData,
      RatingCommentEntity,
      {
        where: {
          id: id,
          ...(userId && { userId: userId }),
        },
      },
    );

    if (!isValidComment) {
      throw new BadRequestException(errorMessage.NOT_FOUND);
    }
  }
}
