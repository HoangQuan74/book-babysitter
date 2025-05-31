import { Controller } from '@nestjs/common';
import { MetaDataService } from './meta-data.service';
import { MessagePattern } from '@nestjs/microservices';
import {
  ECurrency,
  EFilterAge,
  ELanguage,
  ENumberOfChild,
  ENumberOfExperience,
  EnumGender,
  ERating,
  ESortBabysitter,
  EUserRole,
  ScheduleType,
} from '@lib/common/enums';
import {
  FilterAgeText,
  GenderText,
  NumberOfChildText,
  NumberOfExperienceText,
  RatingText,
  SortBabysitterText,
} from '@lib/common/constants';
import { getListYears } from '@lib/utils';
import { LanguageCode } from '@lib/common/types';
import { ICurrency } from '@lib/common/interfaces';

@Controller('meta-data')
export class MetaDataController {
  constructor(private readonly metaDataService: MetaDataService) {}

  @MessagePattern({
    cmd: MetaDataController.prototype.getGenders.name,
  })
  getGenders(languageCode: string) {
    return Object.values(EnumGender).map((gender) => ({
      value: gender,
      text: GenderText[languageCode]?.[gender] || gender,
    }));
  }

  @MessagePattern({
    cmd: MetaDataController.prototype.getListYears.name,
  })
  getListYears(languageCode: LanguageCode) {
    return getListYears(languageCode);
  }

  @MessagePattern({
    cmd: MetaDataController.prototype.getListChild.name,
  })
  getListChild(languageCode: LanguageCode) {
    return Object.values(ENumberOfChild).map((value) => ({
      value: value,
      text: NumberOfChildText[languageCode]?.[value] || value,
    }));
  }

  @MessagePattern({
    cmd: MetaDataController.prototype.getNumExperience.name,
  })
  getNumExperience(languageCode: LanguageCode) {
    return Object.values(ENumberOfExperience).map((value) => ({
      value: value,
      text: NumberOfExperienceText[languageCode]?.[value] || value,
    }));
  }

  @MessagePattern({
    cmd: MetaDataController.prototype.getCurrency.name,
  })
  async getCurrency() {
    return await this.metaDataService.getCurrency();
  }

  @MessagePattern({
    cmd: MetaDataController.prototype.saveCurrency.name,
  })
  async saveCurrency(currencies: ICurrency[]) {
    return this.metaDataService.saveCurrencies(currencies);
  }

  @MessagePattern({
    cmd: MetaDataController.prototype.getEnumFilterAge.name,
  })
  async getEnumFilterAge(lang: LanguageCode) {
    return Object.values(EFilterAge).map((value) => ({
      value: value,
      text: FilterAgeText[lang]?.[value] || value,
    }));
  }

  @MessagePattern({
    cmd: MetaDataController.prototype.getEnumRating.name,
  })
  async getEnumRating(lang: LanguageCode) {
    return Object.values(ERating)
      .filter((value) => typeof value === 'number')
      .map((value) => ({
        value: value,
        text: RatingText[lang]?.[value] || value,
      }));
  }

  @MessagePattern({
    cmd: MetaDataController.prototype.getEnumSortBabysitter.name,
  })
  async getEnumSortBabysitter(lang: LanguageCode) {
    return Object.values(ESortBabysitter).map((value) => ({
      value: value,
      text: SortBabysitterText[lang]?.[value] || value,
    }));
  }

  @MessagePattern({
    cmd: MetaDataController.prototype.getSchedule.name,
  })
  async getSchedule(payload: { date: Date; scheduleType: ScheduleType }) {
    const { date, scheduleType } = payload;
    return await this.metaDataService.getSchedule(date, scheduleType);
  }

  @MessagePattern({
    cmd: MetaDataController.prototype.getLicense.name,
  })
  async getLicense(payload: { app: EUserRole; lang: ELanguage }) {
    const { app, lang } = payload;
    return await this.metaDataService.getLicense(app, lang);
  }
}
