import { errorMessage } from '@lib/common/constants';
import { DbName } from '@lib/common/enums';
import { IRequestUser } from '@lib/common/interfaces';
import { UserImageEntity } from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';
import { isEmpty } from 'lodash';

@Injectable()
export class UserImageService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async deleteUserImageById(reqUser: IRequestUser, id: string) {
    try {
      const isExist = await this.exist(this.postgresData, UserImageEntity, {
        where: { id: id, userId: reqUser.userId },
      });

      if (!isExist) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      return await this.delete(this.postgresData, UserImageEntity, {
        id: id,
      });
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async setUserImageAsDefault(reqUser: IRequestUser, id: string) {
    try {
      const images = await this.getMany(this.postgresData, UserImageEntity, {
        where: { userId: reqUser.userId },
      });

      if (isEmpty(images)) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      const imageDefault = images.find((image) => image.id === id);
      if (!imageDefault) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      const reorderedImages = [
        { ...imageDefault, order: 0 },
        ...images
          .filter((image) => image.id !== id)
          .map((image, index) => ({
            ...image,
            order: index + 1,
          })),
      ];

      await this.create(this.postgresData, UserImageEntity, reorderedImages);

      return true;
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }
}
