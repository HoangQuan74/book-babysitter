import { errorMessage } from '@lib/common/constants';
import {
  DbName,
  EFaqDisplayStatus,
  EFaqType,
  ELanguage,
} from '@lib/common/enums';
import {
  ICreateFaq,
  IFaqQuery,
  IRequestUser,
  IUpdateFaq,
} from '@lib/common/interfaces';
import {
  FaqEntity,
  LanguageEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';

@Injectable()
export class FaqService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async getFaqs(query: IFaqQuery) {
    const { limit, page, faqType, displayStatus, languageId } = query;
    return await this.getPagination(
      this.postgresData,
      FaqEntity,
      {
        page: page,
        size: limit,
      },
      {
        where: {
          ...(faqType && { faqType }),
          ...(displayStatus && { displayStatus }),
          ...(languageId && { languageId }),
        },
        order: {
          displayStatus: 'ASC',
          createdAt: 'DESC',
          order: 'DESC',
        },
        relations: ['language'],
      },
    );
  }

  async getFaqById(id: string) {
    try {
      const faq = await this.getOne(this.postgresData, FaqEntity, {
        where: { id },
        relations: ['language'],
      });

      if (!faq) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      return faq;
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async getUserFaqs(reqUser: IRequestUser, languageCode: ELanguage) {
    return await this.getMany(this.postgresData, FaqEntity, {
      where: {
        faqType: reqUser.role,
        displayStatus: EFaqDisplayStatus.DISPLAY,
        language: { languageCode },
      },
      order: {
        order: 'ASC',
      },
    });
  }

  async createFaq(data: ICreateFaq) {
    try {
      const isValidLanguage = await this.checkValidLanguageId(data.languageId);
      if (!isValidLanguage) {
        throw new BadRequestException(errorMessage.LANGUAGE_NOT_VALID);
      }

      data.order = await this.getFaqOrder(data.faqType);

      return this.create(this.postgresData, FaqEntity, data);
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async updateFaq(data: IUpdateFaq) {
    try {
      if (data.languageId) {
        const isValidLanguage = await this.checkValidLanguageId(
          data.languageId,
        );
        if (!isValidLanguage) {
          throw new BadRequestException(errorMessage.LANGUAGE_NOT_VALID);
        }
      }
      const faqRepository = this.getRepository(this.postgresData, FaqEntity);
      const faq = await this.getOne(this.postgresData, FaqEntity, {
        where: { id: data.id },
      });

      if (!faq) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      if (data.faqType && data.faqType !== faq.faqType) {
        data.order = await this.getFaqOrder(data.faqType);
      }

      faqRepository.merge(faq, data);
      return await faqRepository.save(faq);
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  private async checkValidLanguageId(id: string) {
    const isValidLanguage = await this.exist(
      this.postgresData,
      LanguageEntity,
      {
        where: { id },
      },
    );
    return isValidLanguage;
  }

  private async getFaqOrder(faqType: EFaqType): Promise<number> {
    const order = await this.getRepository(this.postgresData, FaqEntity)
      .createQueryBuilder('faq')
      .select('MAX(faq.order)', 'order')
      .where('faq.faqType = :faqType', { faqType })
      .getRawOne();
    return order?.order + 1 || 1;
  }
}
