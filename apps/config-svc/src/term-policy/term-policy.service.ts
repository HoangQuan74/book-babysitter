import { errorMessage } from '@lib/common/constants';
import {
  DbName,
  ELanguage,
  ESearchTerm,
  EStatusTerm,
  ETermDisplayStatus,
} from '@lib/common/enums';
import {
  IAdminTermQuery,
  ICreateTerm,
  IUpdateTerm,
  IUserTermQuery,
} from '@lib/common/interfaces';
import {
  LanguageEntity,
  TermEntity,
  TermTypeEntity,
  UserTermEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource, ILike, Not } from 'typeorm';

@Injectable()
export class TermPolicyService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }
  async getTerms(filter: IAdminTermQuery) {
    const { termTypeId, displayStatus, status, page, limit, q, typeSearch } =
      filter;

    const queryBuilder = await this.getRepository(this.postgresData, TermEntity)
      .createQueryBuilder('term')
      .leftJoinAndSelect('term.termType', 'termType')
      .leftJoin('term.language', 'language')
      .addSelect(['language.languageName']);

    if (termTypeId) {
      queryBuilder.andWhere('term.termTypeId = :termTypeId', {
        termTypeId,
      });
    }

    if (typeSearch) {
      typeSearch === ESearchTerm.TITLE
        ? queryBuilder.andWhere('term.title ILike :title', { title: `%${q}%` })
        : queryBuilder.andWhere('term.content ILike :content', {
            content: `%${q}%`,
          });
    }

    if (displayStatus) {
      queryBuilder.andWhere('term.displayStatus = :displayStatus', {
        displayStatus,
      });
    }

    if (status) {
      status === EStatusTerm.OLD
        ? queryBuilder.andWhere('term.displayStatus = :status', {
            status: ETermDisplayStatus.CANNOT_DISPLAY,
          })
        : queryBuilder.andWhere('term.displayStatus != :status', {
            status: ETermDisplayStatus.CANNOT_DISPLAY,
          });
    }

    queryBuilder
      .addSelect('date(term.created_at)', 'term_order_created_at')
      .addSelect(
        'CASE WHEN term.display_status = :displayStatusOrder THEN 0 ELSE 1 END',
        'status_order',
      )
      .orderBy('term_order_created_at', 'DESC')
      .addOrderBy('status_order', 'ASC')
      .setParameter('displayStatusOrder', ETermDisplayStatus.DISPLAY)
      .addOrderBy('term.order', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [results, total] = await queryBuilder.getManyAndCount();

    return { results, total };
  }

  async getTermDetail(id: string) {
    const result = await this.getOne(this.postgresData, TermEntity, {
      where: { id },
      relations: ['language', 'termType'],
    });
    return result;
  }

  async getTermUser(lang: ELanguage) {
    const result = await this.getMany(this.postgresData, TermEntity, {
      where: {
        displayStatus: ETermDisplayStatus.DISPLAY,
        language: { languageCode: lang },
      },
      order: { order: 'ASC' },
    });
    return result;
  }

  async saveTerm(term: ICreateTerm) {
    try {
      const isExistTermType = await this.exist(
        this.postgresData,
        TermTypeEntity,
        { where: { id: term.termTypeId } },
      );
      if (!isExistTermType) {
        throw new BadRequestException(errorMessage.BAD_REQUEST);
      }

      const isExistLanguage = await this.exist(
        this.postgresData,
        LanguageEntity,
        { where: { id: term.languageId } },
      );
      if (!isExistLanguage) {
        throw new BadRequestException(errorMessage.BAD_REQUEST);
      }

      term.order = await this.getNextTermOrder(term);
      return await this.create(this.postgresData, TermEntity, term);
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async getNextTermOrder(term: ICreateTerm) {
    const termRepo = this.getRepository(this.postgresData, TermEntity);
    const order = await termRepo
      .createQueryBuilder('term')
      .withDeleted()
      .select('MAX(term.order)', 'max')
      .getRawOne();
    return order.max + 1;
  }

  async updateTerm(id: string, term: IUpdateTerm) {
    try {
      const oldTerm = await this.getOne(this.postgresData, TermEntity, {
        where: { id: id },
      });
      if (!oldTerm) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      if (oldTerm.displayStatus == ETermDisplayStatus.CANNOT_DISPLAY) {
        throw new BadRequestException(errorMessage.CANNOT_UPDATED);
      }

      const notCreateNewVersion =
        term.termTypeId === oldTerm.termTypeId &&
        term.content === oldTerm.content &&
        term.title === oldTerm.title;

      if (notCreateNewVersion) {
        this.getRepository(this.postgresData, TermEntity).merge(oldTerm, term);
        return await this.update(
          this.postgresData,
          TermEntity,
          { id },
          oldTerm,
        );
      }

      oldTerm.displayStatus = ETermDisplayStatus.CANNOT_DISPLAY;
      await this.update(this.postgresData, TermEntity, { id }, oldTerm);

      const newTerm = {
        ...oldTerm,
        ...term,
        id: undefined,
        version: Number((oldTerm.version += 0.1).toFixed(1)),
        displayStatus: ETermDisplayStatus.DISPLAY,
      };
      return await this.create(this.postgresData, TermEntity, newTerm);
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async getTermMetaData() {
    const termTypes = await this.getMany(this.postgresData, TermTypeEntity, {});
    const languages = await this.getMany(this.postgresData, LanguageEntity, {});
    return { termTypes, languages };
  }

  async getServiceTerms() {
    const termType = await this.getOne(this.postgresData, TermTypeEntity, {
      where: {
        deletedAt: null,
      },
      order: {
        id: 'DESC',
      },
    });
    return this.getMany(this.postgresData, TermEntity, {
      where: {
        termTypeId: termType.id,
        displayStatus: ETermDisplayStatus.DISPLAY,
      },
    });
  }
}
