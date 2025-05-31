import { errorMessage } from '@lib/common/constants';
import { DbName, ERequestStatus, ERequestType } from '@lib/common/enums';
import { IRequestUser, IUpdateRequest } from '@lib/common/interfaces';
import {
  RequestContactEntity,
  RequestEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';

@Injectable()
export class RequestContactService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async getRequestContactByRequestId(requestId: string) {
    return await this.getOne(this.postgresData, RequestContactEntity, {
      where: { requestId: requestId },
      select: { id: true, phone: true },
    });
  }

  async createRequestContact(reqUser: IRequestUser, phone: string) {
    return await this.create(this.postgresData, RequestEntity, {
      type: ERequestType.CONTACT_REQUEST,
      status: ERequestStatus.PENDING,
      userId: reqUser.userId,
      contact: {
        phone: phone,
      },
    });
  }

  async updateRequestContact(data: IUpdateRequest) {
    try {
      const request = await this.getOne(this.postgresData, RequestEntity, {
        where: { id: data.id },
        relations: ['contact'],
      });

      if (!request?.contact) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      request.status = data.status;

      return await this.update(
        this.postgresData,
        RequestEntity,
        { id: request.id },
        { status: data.status },
      );
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }
}
