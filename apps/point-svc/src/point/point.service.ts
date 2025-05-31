import {
  errorMessage,
  MAX_COMMENTS_FOR_POINTS,
  POINT_ADDED,
} from '@lib/common/constants';
import { DbName, ETypePoint } from '@lib/common/enums';
import { IAddPoint } from '@lib/common/interfaces';
import {
  PointEntity,
  PointLogEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { getTodayDateRange } from '@lib/utils';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { Between, DataSource } from 'typeorm';

@Injectable()
export class PointService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async addPoint(data: IAddPoint) {
    try {
      const { type } = data;
      switch (type) {
        case ETypePoint.LOGIN:
          return await this.typeLogin(data);
        case ETypePoint.COMMENT:
          return await this.typeComment(data);
        case ETypePoint.POST:
          return await this.typePost(data);
        case ETypePoint.RATING:
          return await this.typeRating(data);
      }
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async upsertPoint(babysitterId: string, pointAdded: number) {
    const point = await this.getOne(this.postgresData, PointEntity, {
      where: { babySitterId: babysitterId },
    });

    return this.create(this.postgresData, PointEntity, {
      id: point?.id,
      babySitterId: babysitterId,
      totalPoint: point ? point.totalPoint + pointAdded : pointAdded,
    });
  }

  async typeLogin({ babysitterId }: IAddPoint) {
    const { start, end } = getTodayDateRange();

    const isExist = await this.exist(this.postgresData, PointLogEntity, {
      where: {
        point: {
          babySitterId: babysitterId,
        },
        type: ETypePoint.LOGIN,
        createdAt: Between(start, end),
      },
    });

    if (isExist) {
      return true;
    }

    const point = await this.upsertPoint(
      babysitterId,
      POINT_ADDED[ETypePoint.LOGIN],
    );

    await this.create(this.postgresData, PointLogEntity, {
      type: ETypePoint.LOGIN,
      pointId: point.id,
      pointAdded: POINT_ADDED[ETypePoint.LOGIN],
      pointAfter: point.totalPoint,
    });
    return true;
  }

  async typeComment({ babysitterId }: IAddPoint) {
    const { start, end } = getTodayDateRange();

    const count = await this.count(this.postgresData, PointLogEntity, {
      where: {
        point: { babySitterId: babysitterId },
        type: ETypePoint.COMMENT,
        createdAt: Between(start, end),
      },
    });

    if (count >= MAX_COMMENTS_FOR_POINTS) {
      return true;
    }

    const point = await this.upsertPoint(
      babysitterId,
      POINT_ADDED[ETypePoint.COMMENT],
    );

    await this.create(this.postgresData, PointLogEntity, {
      type: ETypePoint.COMMENT,
      pointId: point.id,
      pointAdded: POINT_ADDED[ETypePoint.COMMENT],
      pointAfter: point.totalPoint,
    });
    return true;
  }

  async typePost({ babysitterId }: IAddPoint) {
    const { start, end } = getTodayDateRange();

    const count = await this.count(this.postgresData, PointLogEntity, {
      where: {
        point: { babySitterId: babysitterId },
        type: ETypePoint.POST,
        createdAt: Between(start, end),
      },
    });

    if (count >= MAX_COMMENTS_FOR_POINTS) {
      return true;
    }

    const point = await this.upsertPoint(
      babysitterId,
      POINT_ADDED[ETypePoint.POST],
    );

    await this.create(this.postgresData, PointLogEntity, {
      type: ETypePoint.POST,
      pointId: point.id,
      pointAdded: POINT_ADDED[ETypePoint.POST],
      pointAfter: point.totalPoint,
    });
    return true;
  }

  async typeRating({ babysitterId, rating }: IAddPoint) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException(errorMessage.RATING_NOT_VALID);
    }

    const point = await this.upsertPoint(
      babysitterId,
      POINT_ADDED[ETypePoint.RATING](rating),
    );

    await this.create(this.postgresData, PointLogEntity, {
      type: ETypePoint.RATING,
      pointId: point.id,
      pointAdded: POINT_ADDED[ETypePoint.RATING](rating),
      pointAfter: point.totalPoint,
    });
    return true;
  }
}
