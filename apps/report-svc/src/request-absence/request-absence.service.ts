import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseRepository } from '@lib/core/repository/base.service';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DbName, ERequestStatus, ERequestType } from '@lib/common/enums';
import { DataSource } from 'typeorm';
import { Connection } from 'mongoose';
import { IRequestUser, IUpdateRequest } from '@lib/common/interfaces';
import {
  RequestAbsenceEntity,
  RequestEntity,
} from '@lib/core/databases/postgres/entities';
import { errorMessage } from '@lib/common/constants';
import { ExceptionUtil } from '@lib/utils/exception-filter';

@Injectable()
export class RequestAbsenceService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async createRequestAbsence(reqUser: IRequestUser, bookingId: string) {
    return await this.create(this.postgresData, RequestEntity, {
      type: ERequestType.ABSENCE,
      status: ERequestStatus.PENDING,
      userId: reqUser.userId,
      absence: {
        bookingId: bookingId,
      },
    });
  }

  async getRequestAbsenceByRequestId(requestId: string) {
    return await this.getRepository(this.postgresData, RequestAbsenceEntity)
      .createQueryBuilder('absence')
      .where('absence.requestId = :requestId', { requestId })
      .leftJoinAndSelect('absence.booking', 'booking')
      .leftJoin('booking.parent', 'parent')
      .leftJoin('booking.babysitter', 'babysitter')
      .leftJoin('booking.bookingChildren', 'bookingChildren')
      .leftJoin('booking.bookingTimes', 'bookingTimes')
      .leftJoin('booking.currency', 'currency')
      .withDeleted()
      .leftJoin('booking.city', 'city')
      .leftJoin('city.country', 'country')
      .addSelect([
        'parent.id',
        'parent.userCode',
        'parent.username',
        'parent.email',
        'babysitter.id',
        'babysitter.userCode',
        'babysitter.username',
        'babysitter.email',
        'babysitter.phone',
        'city.id',
        'city.name',
        'country.id',
        'country.name',
        'bookingChildren.id',
        'bookingChildren.dob',
        'bookingChildren.gender',
        'bookingTimes.id',
        'bookingTimes.startTime',
        'bookingTimes.endTime',
        'bookingTimes.hasBreakTime',
        'currency.id',
        'currency.unit',
      ])
      .getOne();
  }

  async updateRequestAbsence(data: IUpdateRequest) {
    try {
      const request = await this.getOne(this.postgresData, RequestEntity, {
        where: { id: data.id },
        relations: ['absence'],
      });

      if (!request?.absence) {
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
