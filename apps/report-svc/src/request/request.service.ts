import { DbName, ERequestStatus, ERequestType } from '@lib/common/enums';
import { IRequestQuery } from '@lib/common/interfaces';
import { RequestEntity } from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';
import { RequestContactService } from '../request-contact/request-contact.service';
import { RequestReportService } from '../request-report/request-report.service';
import { RequestQuestionService } from '../request-question/request-question.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { errorMessage } from '@lib/common/constants';
import { RequestAbsenceService } from '../request-absence/request-absence.service';

@Injectable()
export class RequestService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
    private readonly requestContactService: RequestContactService,
    private readonly requestReportService: RequestReportService,
    private readonly requestQuestionService: RequestQuestionService,
    private readonly requestAbsenceService: RequestAbsenceService,
  ) {
    super();
  }

  async getRequests(query: IRequestQuery) {
    const { limit, page, type, status, startDate, endDate } = query;
    const queryBuilder = this.getRepository(
      this.postgresData,
      RequestEntity,
    ).createQueryBuilder('request');

    if (type) {
      queryBuilder.andWhere('request.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('request.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('request.createdAt >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('request.createdAt <= :endDate', {
        endDate,
      });
    }

    const [results, total] = await queryBuilder
      .orderBy(
        'CASE WHEN request.status = :statusOrder THEN 1 ELSE 0 END',
        'ASC',
      )
      .setParameter('statusOrder', ERequestStatus.SUCCESS)
      .addOrderBy('request.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { results, total };
  }

  async getRequestById(id: string) {
    try {
      const request = await this.getOne(this.postgresData, RequestEntity, {
        where: { id },
        relations: ['user'],
        select: {
          id: true,
          type: true,
          status: true,
          createdAt: true,
          user: {
            id: true,
            username: true,
          },
        },
      });

      if (!request) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      const detailFetchers = {
        [ERequestType.CONTACT_REQUEST]: (id: string) =>
          this.requestContactService.getRequestContactByRequestId(id),
        [ERequestType.REPORT]: (id: string) =>
          this.requestReportService.getRequestReportByRequestId(id),
        [ERequestType.QUESTION]: (id: string) =>
          this.requestQuestionService.getRequestQuestionByRequestId(id),
        [ERequestType.ABSENCE]: () =>
          this.requestAbsenceService.getRequestAbsenceByRequestId(id),
      };

      const detailFetcher = detailFetchers[request.type];
      request.detail = await detailFetcher(id);

      return request;
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }
}
