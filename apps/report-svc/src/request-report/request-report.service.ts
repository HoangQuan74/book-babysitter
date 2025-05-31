import { errorMessage } from '@lib/common/constants';
import { DbName, ERequestStatus, ERequestType } from '@lib/common/enums';
import { IRequestReport, IRequestUser } from '@lib/common/interfaces';
import {
  RequestEntity,
  RequestReportEntity,
  UserEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';

@Injectable()
export class RequestReportService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async getRequestReportByRequestId(requestId: string) {
    return await this.getOne(this.postgresData, RequestReportEntity, {
      where: { requestId: requestId },
      relations: ['accused', 'answerer'],
      select: {
        id: true,
        reason: true,
        createdAt: true,
        answer: true,
        answeredAt: true,
        accused: { id: true, username: true },
        answerer: { id: true, username: true },
      },
    });
  }

  async createRequestReport(reqUser: IRequestUser, data: IRequestReport) {
    try {
      const accused = await this.exist(this.postgresData, UserEntity, {
        where: { id: data.accusedId },
      });

      if (!accused) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      return await this.create(this.postgresData, RequestEntity, {
        type: ERequestType.REPORT,
        status: ERequestStatus.PENDING,
        userId: reqUser.userId,
        report: {
          accusedId: data.accusedId,
          reason: data.reason,
        },
      });
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async answerRequestReport(reqUser: IRequestUser, data: IRequestReport) {
    try {
      const request = await this.getOne(this.postgresData, RequestEntity, {
        where: { id: data.id },
        relations: ['report'],
      });

      if (!request?.report) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      // TODO: SEND MAIL TO ACCUSER

      request.status = ERequestStatus.SUCCESS;
      request.report.answer = data.answer;
      request.report.answerId = reqUser.userId;
      request.report.answeredAt = new Date();

      return await this.create(this.postgresData, RequestEntity, request);
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }
}
