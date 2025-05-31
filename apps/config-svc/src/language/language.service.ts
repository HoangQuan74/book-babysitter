import {
  DbName,
  ELanguage,
  ELanguageLevel,
  EUserRole,
} from '@lib/common/enums';
import {
  LanguageEntity,
  UserEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {
  errorMessage,
  LanguageLevelText,
  LanguageText,
} from '@lib/common/constants';
import { IRequestUser } from '@lib/common/interfaces';
import { ExceptionUtil } from '@lib/utils/exception-filter';

@Injectable()
export class LanguageService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }
  async getConfigLanguages(languageCode: string) {
    const languages = await this.getMany(this.postgresData, LanguageEntity, {
      order: { createdAt: 'ASC' },
    });
    languages.forEach((language) => {
      language.name = LanguageText[languageCode]?.[language.languageCode];
      language.levels = Object.values(ELanguageLevel).map((level) => ({
        value: level,
        text:
          LanguageLevelText[languageCode]?.[language.languageCode]?.[level] ||
          level,
      }));
    });
    return languages;
  }
  async getLanguages(app: EUserRole) {
    const result = await this.getMany(this.postgresData, LanguageEntity, {
      where: {
        languageCode: In([ELanguage.ko, ELanguage.vi]),
      },
    });
    if (app === EUserRole.PARENT) {
      return result.filter(
        (language) => language.languageCode === ELanguage.ko,
      );
    }
    return result;
  }

  async saveLanguageSettingLanguage(reqUser: IRequestUser, lang: string) {
    try {
      const language = await this.getOne(this.postgresData, LanguageEntity, {
        where: { languageCode: lang },
        select: { id: true },
      });

      if (!language) throw new BadRequestException(errorMessage.NOT_FOUND);

      return await this.update(
        this.postgresData,
        UserEntity,
        { id: reqUser.userId },
        {
          settingLanguageId: language.id,
        },
      );
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }
}
