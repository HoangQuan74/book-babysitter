import { errorMessage } from '@lib/common/constants';
import { DbName, EUserRole } from '@lib/common/enums';
import { IQuery, IRatingUser, IRequestUser } from '@lib/common/interfaces';
import {
  RatingCommentEntity,
  RatingCommentImageEntity,
  RatingUserEntity,
  ReviewBabysitterEntity,
  ReviewEntity,
  UserEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource, In, Not } from 'typeorm';
import { isEmpty } from 'lodash';
import { AwsClientService } from '@lib/utils/aws-client';
import { formatKey } from '@lib/utils';

@Injectable()
export class RatingUserService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,

    private readonly awsClientService: AwsClientService,
  ) {
    super();
  }

  async getRatingUserById(ratingId: string) {
    const queryBuilder = this.getRepository(this.postgresData, RatingUserEntity)
      .createQueryBuilder('rating')
      .leftJoin('rating.parent', 'parent')
      .leftJoinAndMapOne(
        'parent.avatarCommenter',
        'parent.userImages',
        'avatarCommenter',
        'avatarCommenter.order = 0',
      )
      .leftJoin('rating.comment', 'comment', 'comment.parentId is null')
      .leftJoin('comment.images', 'images')
      .leftJoin('comment.children', 'children')
      .leftJoin('children.user', 'userReply')
      .leftJoinAndMapOne(
        'userReply.avatarUser',
        'userReply.userImages',
        'avatarUser',
        'avatarUser.order = 0',
      )
      .where('rating.id = :ratingId', { ratingId })
      .select([
        'rating.id',
        'rating.point',
        'parent.username',
        'parent.id',
        'comment.id',
        'comment.content',
        'comment.createdAt',
        'children.id',
        'children.content',
        'children.createdAt',
        'userReply.id',
        'userReply.username',
        'images.url',
        'avatarCommenter.url',
        'avatarUser.url',
      ]);
    return await queryBuilder.getOne();
  }

  async createRatingBabysitter(reqUser: IRequestUser, data: IRatingUser) {
    try {
      const { comment, reviewIds, id } = data;

      if (reqUser.role !== EUserRole.PARENT)
        throw new BadRequestException(errorMessage.FORBIDDEN);

      const isExistBabysitter = await this.exist(
        this.postgresData,
        UserEntity,
        {
          where: { id: data.babysitterId, role: EUserRole.BABY_SITTER },
        },
      );

      if (!isExistBabysitter)
        throw new BadRequestException(errorMessage.NOT_FOUND);

      const ratingInstance = this.createInstance(
        this.postgresData,
        RatingUserEntity,
        {
          parentId: reqUser.userId,
          babysitterId: data.babysitterId,
          point: data.point,
          bookingId: data.bookingId,
        },
      );

      if (!isEmpty(reviewIds)) {
        const isValidReview = await this.exist(
          this.postgresData,
          ReviewEntity,
          { where: { id: In(reviewIds) } },
        );
        if (!isValidReview)
          throw new BadRequestException(errorMessage.BAD_REQUEST);

        ratingInstance.reviewBabysitters = reviewIds.map((reviewId) =>
          this.createInstance(this.postgresData, ReviewBabysitterEntity, {
            babysitterId: data.babysitterId,
            reviewId,
          }),
        );
      }

      let urlPresigned = [];
      if (comment) {
        const { content, images } = comment;
        let imageInstances;
        if (!isEmpty(images)) {
          const imageFormat = await Promise.all(
            images.map(async (image) => {
              if (!image.url) {
                const url = await this.awsClientService.createS3PresignedUrl(
                  formatKey(reqUser, image.key),
                );
                urlPresigned.push(url);
                image.url = url.split('?')[0];
              }
              return image;
            }),
          );
          imageInstances = imageFormat.map((image) => {
            return this.createInstance(
              this.postgresData,
              RatingCommentImageEntity,
              {
                url: image.url,
              },
            );
          });
        }
        ratingInstance.comment = this.createInstance(
          this.postgresData,
          RatingCommentEntity,
          {
            content: content,
            userId: reqUser.userId,
            images: imageInstances,
          },
        );
      }

      if (id) {
        if (ratingInstance.comment?.images) {
          const comment = await this.getOne(
            this.postgresData,
            RatingCommentEntity,
            { where: { ratingId: id }, select: { id: true } },
          );
          await this.delete(this.postgresData, RatingCommentImageEntity, {
            ratingCommentId: comment.id,
          });
        }
        if (reviewIds) {
          await this.delete(this.postgresData, ReviewBabysitterEntity, {
            ratingId: id,
          });
        }
        const rating = await this.getOne(this.postgresData, RatingUserEntity, {
          where: {
            id: data.id,
          },
          relations: ['comment', 'comment.images', 'reviewBabysitters'],
        });

        if (!rating) throw new BadRequestException(errorMessage.NOT_FOUND);
        this.getRepository(this.postgresData, RatingUserEntity).merge(
          rating,
          ratingInstance,
        );

        const result = await this.create(
          this.postgresData,
          RatingUserEntity,
          rating,
        );
        return { ...result, urlPresigned };
      }

      const result = await this.create(
        this.postgresData,
        RatingUserEntity,
        ratingInstance,
      );

      await this.updateAvgRatingUser(data.babysitterId);

      return { ...result, urlPresigned };
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async updateAvgRatingUser(userId: string) {
    const rating = await this.getRepository(this.postgresData, RatingUserEntity)
      .createQueryBuilder('rating')
      .where('rating.babysitterId = :babysitterId', { babysitterId: userId })
      .select('AVG(rating.point)', 'avg')
      .getRawOne();

    await this.update(
      this.postgresData,
      UserEntity,
      { id: userId },
      { avgRating: rating.avg },
    );
  }

  async deleteRatingBabysitter(reqUser: IRequestUser, id: string) {
    try {
      const rating = await this.getOne(this.postgresData, RatingUserEntity, {
        where: {
          id,
          parentId: reqUser.userId,
        },
      });
      if (!rating) throw new BadRequestException(errorMessage.NOT_FOUND);
      return await this.delete(this.postgresData, RatingUserEntity, {
        id,
      });
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async getRatingBabysitterById(reqUser: IRequestUser, id: string) {
    return await this.getRepository(this.postgresData, RatingUserEntity)
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.comment', 'comment')
      .leftJoinAndSelect('comment.images', 'images')
      .leftJoinAndSelect('rating.reviewBabysitters', 'reviewBabysitters')
      .leftJoin('rating.booking', 'booking')
      .leftJoin('booking.babysitter', 'babysitter')
      .leftJoinAndMapOne(
        'babysitter.avatar',
        'babysitter.userImages',
        'avatar',
        'avatar.order = 0',
      )
      .leftJoinAndSelect('booking.bookingTimes', 'bookingTime')
      .addSelect(['booking.id', 'babysitter.id', 'babysitter.username'])
      .where('rating.id = :id', { id })
      .getOne();
  }

  async getRatingNotification(reqUser: IRequestUser, query: IQuery) {
    const { limit, page } = query;
    const queryBuilder = this.getRepository(this.postgresData, RatingUserEntity)
      .createQueryBuilder('rating')
      .leftJoin('rating.parent', 'parent')
      .leftJoinAndSelect('rating.comment', 'comment')
      .leftJoin('rating.booking', 'booking')
      .leftJoinAndSelect('booking.bookingTimes', 'bookingTime')
      .addSelect(['booking.id', 'parent.id', 'parent.username'])
      .where('rating.babysitterId = :userId', { userId: reqUser.userId })
      .andWhere('rating.isSeen is false');

    const [results, total] = await queryBuilder
      .orderBy('rating.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { results, total };
  }

  async seenRatingNotification(reqUser: IRequestUser, id: string) {
    return this.update(
      this.postgresData,
      RatingUserEntity,
      { id, babysitterId: reqUser.userId },
      { isSeen: true },
    );
  }
}
