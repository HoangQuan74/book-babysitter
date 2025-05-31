import { errorMessage } from '@lib/common/constants';
import { DbName, EPostReactType } from '@lib/common/enums';
import { IRequestUser } from '@lib/common/interfaces';
import {
  PostEntity,
  PostReactEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';

@Injectable()
export class PostReactService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async toggleReact(reqUser: IRequestUser, data: any) {
    try {
      const { postId } = data;
      const { userId } = reqUser;

      const existPost = await this.exist(this.postgresData, PostEntity, {
        where: {
          id: postId,
          isVisible: true,
        },
      });

      if (!existPost) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      const react = await this.getOne(this.postgresData, PostReactEntity, {
        where: { userId: userId, postId: postId },
      });

      if (react) {
        return await this.delete(this.postgresData, PostReactEntity, {
          userId: userId,
          postId: postId,
        });
      } else {
        return await this.create(this.postgresData, PostReactEntity, {
          userId: userId,
          postId: postId,
          type: EPostReactType.LIKE,
        });
      }
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }
}
