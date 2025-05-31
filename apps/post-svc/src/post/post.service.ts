import { errorMessage, mutationResult } from '@lib/common/constants';
import {
  DbName,
  EService,
  ETargetUserType,
  ETypePoint,
} from '@lib/common/enums';
import { IQuery, IRequestUser, PostSearchResult } from '@lib/common/interfaces';
import {
  CityEntity,
  PostEntity,
  PostViewEntity,
} from '@lib/core/databases/postgres/entities';
import { PostCategoryEntity } from '@lib/core/databases/postgres/entities/post-category.entity';
import { PostSearchEntity } from '@lib/core/databases/postgres/entities/post-search.entity';
import { PostTypeEntity } from '@lib/core/databases/postgres/entities/post-type.entity';
import { BaseRepository } from '@lib/core/repository/base.service';
import { formatKey } from '@lib/utils';
import { AwsClientService } from '@lib/utils/aws-client/aws-client.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectDataSource } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Between, Brackets, DataSource, ILike } from 'typeorm';
import { isEmpty } from 'lodash';
import * as moment from 'moment';
import { MessageBuilder } from '@lib/core/message-builder';

@Injectable()
export class PostService extends BaseRepository {
  index = 'posts';
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    private readonly awsClientService: AwsClientService,
    private readonly messageBuilder: MessageBuilder,
  ) {
    super();
  }

  async searchPost(data) {
    try {
      const { languageCode } = data;
      const { search = '', limit, page } = data.query;
      const { userId } = data.user;
      const [searchedPosts, searchData] = await Promise.all([
        this.getRepository(this.postgresData, PostEntity)
          .createQueryBuilder('post')
          .leftJoin('post.owner', 'owner')
          .leftJoin('post.category', 'category')
          .leftJoin('post.city', 'city')
          .leftJoin('post.country', 'country')
          .loadRelationCountAndMap(
            'post.countComment',
            'post.comment',
            'comment',
          )
          .loadRelationCountAndMap(
            'post.isViewed',
            'post.view',
            'userView',
            (qb) => qb.where('userView.viewerId = :userId', { userId: userId }),
          )
          .select([
            'post.id',
            'post.title',
            'post.files',
            'post.createdAt',
            'post.countView',
          ])
          .addSelect(['category.id', 'category.name'])
          .addSelect(['owner.id', 'owner.username'])
          .addSelect(['country.id', `country.name`])
          .addSelect(['city.id', `city.name`])
          .where('post.isAdminPost = false')
          .andWhere('post.title ILIKE :search', { search: `%${search}%` })
          .orWhere('owner.username ILIKE :search', { search: `%${search}%` })
          // .orWhere(`city.name::jsonb->${languageCode} ? '${search}'`)
          .take(limit)
          .skip((page - 1) * limit)
          .getMany(),
        !isEmpty(search) &&
          this.upsert(
            this.postgresData,
            PostSearchEntity,
            {
              userId,
              search,
            },
            {
              userId,
              search,
            },
          ),
      ]);
      return searchedPosts;
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }
  async deleteSearchHistory(data) {
    try {
      const { id } = data;
      await this.delete(this.postgresData, PostSearchEntity, { id });
      return mutationResult;
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async updateUserPost(data) {
    try {
      const { id, user, body } = data;
      const { files, ...rest } = body;
      const images = [];
      await Promise.all(
        files.map(async (file) => {
          const key = formatKey(user, file.key);
          const url = await this.awsClientService.createS3PresignedUrl(key);
          images.push({
            ...file,
            id: file?.id || randomUUID(),
            url: file?.url || url.split('?')[0],
          });
          file.url = file?.url || url;
        }),
      );
      await this.update(
        this.postgresData,
        PostEntity,
        { id },
        { ...rest, files: images },
      );
      const updatedPost = await this.getOne(this.postgresData, PostEntity, {
        where: {
          id,
        },
      });
      return Object.assign(updatedPost, { files });
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async getHistorySearch(data) {
    const { userId } = data.user;
    return this.getPagination(
      this.postgresData,
      PostSearchEntity,
      {
        page: 1,
        size: 10,
      },
      {
        userId,
      },
    );
  }

  async deletePost(data) {
    try {
      const { id } = data;
      await this.softDelete(this.postgresData, PostEntity, { id });
      return mutationResult;
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async getListPost(data) {
    const { limit, page } = data.query;
    const { createdAt, sort, isVisible, search, typeId } = data.body;
    const where = {};
    if (createdAt) {
      const startDate = moment(createdAt).startOf('day');
      const endDate = moment(createdAt).endOf('day');
      Object.assign(where, { createdAt: Between(startDate, endDate) });
    }
    if (typeof isVisible === 'boolean') {
      Object.assign(where, { isVisible: isVisible });
    }
    if (typeId) {
      Object.assign(where, { typeId });
    }
    if (search?.title) {
      Object.assign(where, { title: ILike(`%${search.title}%`) });
    }

    if (search?.owner) {
      Object.assign(where, {
        owner: {
          username: ILike(`%${search.owner}%`),
        },
      });
    }

    return await this.getPagination(
      this.postgresData,
      PostEntity,
      { page, size: limit },
      {
        where,
        order: sort,
        relations: ['owner'],
      },
    );
  }

  async getNotificationPostList(reqUser: IRequestUser, query: IQuery) {
    const { role } = reqUser;
    const { limit, page } = query;
    const queryBuilder = await this.getRepository(this.postgresData, PostEntity)
      .createQueryBuilder('post')
      .leftJoin('post.owner', 'owner')
      .leftJoin('post.category', 'category')
      .leftJoin('post.type', 'type')
      .where('post.isVisible IS TRUE')
      .andWhere('post.isAdminPost IS TRUE')
      .andWhere(
        new Brackets((qb) =>
          qb
            .orWhere('post.targetUserType = :targetUserType', {
              targetUserType: role,
            })
            .orWhere('post.targetUserType = :targetUserTypeAll', {
              targetUserTypeAll: ETargetUserType.ALL,
            }),
        ),
      )
      .addSelect([
        'owner.id',
        'owner.username',
        'owner.avatar',
        'category.id',
        'category.name',
        'type.id',
        'type.name',
      ]);

    const [results, total] = await queryBuilder
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { results, total };
  }

  async getListUserPost(data) {
    const { limit = 10, page = 1, languageCode, userId } = data;
    const [total, latestPost, userPost] = await Promise.all([
      this.count(this.postgresData, PostEntity, {
        where: {
          isAdminPost: true,
        },
      }),
      this.getOne(this.postgresData, PostEntity, {
        where: {
          isAdminPost: true,
        },
        order: {
          createdAt: 'DESC',
        },
        select: {
          createdAt: true,
        },
      }),
      this.getRepository(this.postgresData, PostEntity)
        .createQueryBuilder('post')
        .leftJoin('post.owner', 'owner')
        .leftJoin('post.category', 'category')
        .leftJoin('post.city', 'city')
        .leftJoin('post.country', 'country')
        .loadRelationCountAndMap('post.countComment', 'post.comment', 'comment')
        .loadRelationCountAndMap(
          'post.isViewed',
          'post.view',
          'userView',
          (qb) => qb.where('userView.viewerId = :userId', { userId: userId }),
        )
        .select([
          'post.id',
          'post.title',
          'post.files',
          'post.createdAt',
          'post.countView',
        ])
        .addSelect(['category.id', 'category.name'])
        .addSelect(['owner.id', 'owner.username'])
        .addSelect(['country.id', `country.name`])
        .addSelect(['city.id', `city.name`])
        .where('post.isAdminPost = false')
        .andWhere('post.isVisible = true')
        .orderBy('post.createdAt', 'DESC')
        .take(limit)
        .skip((page - 1) * limit)
        .getMany(),
    ]);
    return {
      notification: { total, latestPostDate: latestPost?.createdAt },
      userPost,
    };
  }

  async getPostType(data) {
    const { languageCode, isActive } = data;
    const repo = this.getRepository(this.postgresData, PostTypeEntity);
    return await repo
      .createQueryBuilder('type')
      .select(['type.id AS id', `type.name->'${languageCode}' AS name`, 'type.type AS type'])
      .where(
        typeof isActive === 'boolean' ? 'type.isActive = :isActive' : 'true',
        { isActive },
      )
      .getRawMany();
  }

  async getPostCategory(data) {
    const { languageCode } = data;
    const repo = this.getRepository(this.postgresData, PostCategoryEntity);
    return await repo
      .createQueryBuilder('category')
      .select(['category.id AS id', `category.name->'${languageCode}' AS name`])
      .getRawMany();
  }

  async createPost(data) {
    try {
      const { user } = data;
      const { files, categoryId, typeId, ...rest } = data.body;
      if (data.body?.cityId) {
        const city = await this.getOne(this.postgresData, CityEntity, {
          where: {
            id: data.body?.cityId,
          },
        });
        rest.countryId = city.countryId;
      }
      const images = [];
      await Promise.all(
        files.map(async (file) => {
          const key = formatKey(user, file.key);
          const url = await this.awsClientService.createS3PresignedUrl(key);
          images.push({ id: randomUUID(), ...file, url: url.split('?')[0], directUrl: file.directUrl });
          file.url = url;
        }),
      );
      const post = await this.create(this.postgresData, PostEntity, {
        ...rest,
        categoryId: categoryId || '13890642-4fdc-4340-907f-5bea89313eab',
        typeId: typeId || '2e3d37c7-2651-41f5-8e93-660b86f1a472',
        files: images,
        ownerId: user.userId,
      });

      this.messageBuilder.sendMessage(
        EService.POINT,
        { babysitterId: user.userId, type: ETypePoint.POST },
        {
          cmd: 'addPoint',
        },
      );

      return Object.assign(post, { files });
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async getPostDetail(data) {
    const { id, languageCode } = data;
    const query = await this.getRepository(this.postgresData, PostEntity)
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.type', 'type')
      .leftJoinAndSelect('post.country', 'country')
      .leftJoinAndSelect('post.city', 'city')
      .leftJoinAndSelect('post.owner', 'owner')
      .where('post.id =:id', { id })
      .getOne();
    return query;
  }

  async updatePost(data) {
    try {
      const { id, body, user } = data;
      const { files, ...rest } = body;
      const images = [];
      await Promise.all(
        files.map(async (file) => {
          const key = formatKey(user, file.key);
          const url = await this.awsClientService.createS3PresignedUrl(key);
          images.push({
            ...file,
            id: file?.id || randomUUID(),
            url: file?.url || url.split('?')[0],
          });
          file.url = file?.url || url;
        }),
      );
      await this.update(
        this.postgresData,
        PostEntity,
        { id },
        { ...rest, files: images, updatedAt: new Date() },
      );
      const updatedPost = await this.getOne(this.postgresData, PostEntity, {
        where: {
          id,
        },
      });
      return Object.assign(updatedPost, { ...files, updatedAt: new Date() });
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async getListUserPostByUserId(query: IQuery, userId: string) {
    const queryBuilder = await this.getRepository(this.postgresData, PostEntity)
      .createQueryBuilder('post')
      .leftJoin('post.type', 'type')
      .leftJoin('post.country', 'country')
      .leftJoin('post.city', 'city')
      .leftJoin('post.owner', 'owner')
      .leftJoin('post.category', 'category')
      .loadRelationCountAndMap('post.countComment', 'post.comment')
      .addSelect([
        'country.id',
        'country.name',
        'city.id',
        'city.name',
        'type.id',
        'type.name',
      ])
      .addSelect(['category.id', 'category.name'])
      .addSelect(['owner.id', 'owner.username'])
      .where('post.ownerId =:ownerId', { ownerId: userId });

    const [results, total] = await queryBuilder
      .orderBy('post.createdAt', 'DESC')
      .skip(query.page - 1)
      .take(query.limit)
      .getManyAndCount();
    return { results, total };
  }

  async getPostById(reqUser: IRequestUser, id: string) {
    try {
      const queryBuilder = await this.getRepository(
        this.postgresData,
        PostEntity,
      )
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.category', 'category')
        .leftJoin('post.type', 'type')
        .leftJoin('post.country', 'country')
        .leftJoin('post.city', 'city')
        .loadRelationCountAndMap('post.countComment', 'post.comment')
        .loadRelationCountAndMap('post.reacted', 'post.react', 'react', (qb) =>
          qb.where('react.userId = :userId', { userId: reqUser.userId }),
        )
        .leftJoin('post.owner', 'owner')
        .leftJoinAndMapOne(
          'owner.avatar',
          'owner.userImages',
          'avatar',
          'avatar.order = 0',
        )
        .where('post.id =:id', { id })
        .addSelect([
          'country.id',
          'country.name',
          'city.id',
          'city.name',
          'type.id',
          'type.name',
          'owner.id',
          'owner.username',
          'owner.role',
          'avatar.url',
        ]);
      const post = await queryBuilder.getOne();

      if (!post) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      await this.update(
        this.postgresData,
        PostEntity,
        { id: post.id },
        { countView: post.countView + 1 },
      );

      await this.upsert(
        this.postgresData,
        PostViewEntity,
        { postId: id, viewerId: reqUser.userId },
        { postId: id, viewerId: reqUser.userId },
      );

      return post;
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async getPostReacted(reqUser: IRequestUser, query: IQuery) {
    const { userId } = reqUser;

    const queryBuilder = await this.getRepository(this.postgresData, PostEntity)
      .createQueryBuilder('post')
      .innerJoin('post.react', 'react', 'react.userId = :userId', { userId })
      .leftJoin('post.type', 'type')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoin('post.country', 'country')
      .leftJoin('post.city', 'city')
      .loadRelationCountAndMap('post.countComment', 'post.comment')
      .leftJoin('post.owner', 'owner')
      .leftJoinAndMapOne(
        'owner.avatar',
        'owner.userImages',
        'avatar',
        'avatar.order = 0',
      )
      .addSelect([
        'country.id',
        'country.name',
        'city.id',
        'city.name',
        'type.id',
        'type.name',
        'owner.id',
        'owner.username',
        'avatar.url',
      ]);

    const [results, total] = await queryBuilder
      .orderBy('post.createdAt', 'DESC')
      .skip(query.page - 1)
      .take(query.limit)
      .getManyAndCount();
    return { results, total };
  }
}
