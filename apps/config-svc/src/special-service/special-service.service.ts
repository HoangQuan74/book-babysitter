import { DbName } from '@lib/common/enums';
import { SpecialServiceEntity } from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource, In, Not } from 'typeorm';
import { isEmpty } from 'lodash';
import { mutationResult } from '@lib/common/constants';
import { ExceptionUtil } from '@lib/utils/exception-filter';

@Injectable()
export class SpecialServiceService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }
  async getSpecialServices(data) {
    const { languageCode } = data;
    const query = this.getRepository(this.postgresData, SpecialServiceEntity);
    return await query
      .createQueryBuilder('service')
      .select([
        'service.id AS id',
        `service.content->'${languageCode}' AS content`,
      ])
      .addSelect(`service.short_content->'${languageCode}'`, 'shortContent')
      .getRawMany();
  }

  async deleteSpecialService(data) {
    try {
      const { id } = data;
      await this.softDelete(this.postgresData, SpecialServiceEntity, {
        id,
      });
      return mutationResult;
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async createSpecialService(data) {
    const { langCode, details } = data;
    const newServices = [];
    const newService = details
      .filter((data) => !!data.id)
      .map((data) => data.id);
    await this.softDelete(this.postgresData, SpecialServiceEntity, {
      id: Not(In(newService)),
    });
    await Promise.all(
      details.map(async (detail) => {
        const { content, shortContent } = detail;
        if (isEmpty(detail.id)) {
          newServices.push({
            content: {
              [langCode]: content,
            },
            shortContent: {
              [langCode]: shortContent,
            },
          });
        } else {
          const service = await this.getOne(
            this.postgresData,
            SpecialServiceEntity,
            {
              where: {
                id: detail.id,
              },
            },
          );
          await this.update(
            this.postgresData,
            SpecialServiceEntity,
            { id: detail.id },
            {
              content: Object.assign(service.content, {
                [langCode]: content,
              }),
              shortContent: Object.assign(service.shortContent, {
                [langCode]: shortContent,
              }),
            },
          );
        }
      }),
    );
    if (!isEmpty(newServices)) {
      await this.create(this.postgresData, SpecialServiceEntity, newServices);
    }
    return mutationResult;
  }
}
