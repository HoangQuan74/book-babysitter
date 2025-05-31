import { errorMessage } from '@lib/common/constants';
import {
  DbName,
  ERequestStatus,
  ERequestType,
  EUserRole,
} from '@lib/common/enums';
import { IRequestQuestion, IRequestUser } from '@lib/common/interfaces';
import {
  RequestEntity,
  RequestQuestionEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource, Not } from 'typeorm';

@Injectable()
export class RequestQuestionService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async getRequestQuestionByRequestId(requestId: string) {
    return await this.getRepository(this.postgresData, RequestQuestionEntity)
      .createQueryBuilder('question')
      .leftJoin('question.user', 'user')
      .leftJoinAndMapOne(
        'user.avatar',
        'user.userImages',
        'avatar',
        'avatar.order = 0',
      )
      .select([
        'question.id',
        'question.content',
        'question.createdAt',
        'user.id',
        'user.username',
        'user.role',
        'avatar.url',
      ])
      .where('question.requestId = :requestId', { requestId })
      .orderBy('question.createdAt', 'ASC')
      .getMany();
  }

  async createRequestQuestion(
    reqUser: IRequestUser,
    data: IRequestQuestion,
  ): Promise<RequestQuestionEntity> {
    try {
      if (!data.id) {
        return this.createNewRequest(reqUser, data);
      }

      const request = await this.getExistingRequest(data.id);
      await this.validateAndUpdateRequest(request, reqUser);

      return this.createRequestQuestionEntity(data, reqUser);
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  private async createNewRequest(
    reqUser: IRequestUser,
    data: IRequestQuestion,
  ): Promise<RequestQuestionEntity> {
    const request = await this.create(this.postgresData, RequestEntity, {
      type: ERequestType.QUESTION,
      status: ERequestStatus.PENDING,
      userId: reqUser.userId,
    });

    return this.createRequestQuestionEntity(
      {
        ...data,
        id: request.id,
      },
      reqUser,
    );
  }

  private async getExistingRequest(id: string): Promise<RequestEntity> {
    const request = await this.getOne(this.postgresData, RequestEntity, {
      where: { id },
    });

    if (!request) {
      throw new BadRequestException(errorMessage.NOT_FOUND);
    }

    return request;
  }

  private async validateAndUpdateRequest(
    request: RequestEntity,
    reqUser: IRequestUser,
  ): Promise<void> {
    if (request.status === ERequestStatus.SUCCESS) {
      throw new BadRequestException(errorMessage.REQUEST_IS_SUCCESS);
    }

    if (
      [EUserRole.ADMIN, EUserRole.MANAGER].includes(reqUser.role) &&
      request.status === ERequestStatus.PENDING
    ) {
      request.status = ERequestStatus.IN_PROGRESS;
      await this.update(
        this.postgresData,
        RequestEntity,
        { id: request.id },
        request,
      );
    }
  }

  private async createRequestQuestionEntity(
    data: IRequestQuestion,
    reqUser: IRequestUser,
  ): Promise<RequestQuestionEntity> {
    return this.create(this.postgresData, RequestQuestionEntity, {
      requestId: data.id,
      content: data.content,
      userId: reqUser.userId,
    });
  }

  async setRequestQuestionToSuccess(id: string) {
    try {
      const request = await this.getExistingRequest(id);
      request.status = ERequestStatus.SUCCESS;
      return await this.update(
        this.postgresData,
        RequestEntity,
        { id: request.id },
        request,
      );
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async getRequestQuestions(reqUser: IRequestUser) {
    const queryBuilder = this.getRepository(this.postgresData, RequestEntity)
      .createQueryBuilder('request')
      .loadRelationCountAndMap('request.countQuestion', 'request.questions')
      .leftJoinAndMapOne(
        'request.lastQuestion',
        'request.questions',
        'lastQuestion',
        'lastQuestion.createdAt = (SELECT MAX(created_at) FROM request_question WHERE request_question.request_id = request.id)',
      )
      .leftJoin('lastQuestion.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.role'])
      .where('request.type = :type', { type: ERequestType.QUESTION })
      .andWhere('request.userId = :userId', { userId: reqUser.userId });

    return await queryBuilder
      .orderBy(
        'CASE WHEN request.status = :successStatus THEN 1 ELSE 0 END',
        'ASC',
      )
      .addOrderBy('lastQuestion.createdAt', 'DESC')
      .setParameter('successStatus', ERequestStatus.SUCCESS)
      .getMany();
  }

  async readRequestQuestion(reqUser: IRequestUser, id: string) {
    try {
      const request = await this.getExistingRequest(id);
      return this.update(
        this.postgresData,
        RequestQuestionEntity,
        { requestId: id, isRead: false, userId: Not(reqUser.userId) },
        { isRead: true },
      );
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }
}
