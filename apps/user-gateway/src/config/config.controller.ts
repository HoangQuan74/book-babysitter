import { Controller, Get, Query } from '@nestjs/common';
import { MessageBuilder } from '@lib/core/message-builder/message-builder.service';
import { EService, EUserRole } from '@lib/common/enums';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TermQueryDto } from './dto/term-query.dto';
import { AppName, LanguageCode, Public } from '@lib/common/decorator';
import { AgeChildDto, QueryScheduleDto } from './dto';
import { OPEN_SOURCE_LICENSE } from '@lib/common/constants';

@Public()
@Controller('config')
@ApiTags('Config')
export class ConfigController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @ApiSecurity('X-LANG-CODE')
  @Get('terms')
  async getTermUser(
    @Query() query: TermQueryDto,
    @LanguageCode() lang: string,
  ) {
    return await this.messageBuilder.sendMessage(EService.CONFIG, lang, {
      cmd: ConfigController.prototype.getTermUser.name,
    });
  }

  @ApiSecurity('X-APP-NAME')
  @Get('introduction/image')
  async getIntroductionImage(@AppName() type: EUserRole) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { type },
      { cmd: ConfigController.prototype.getIntroductionImage.name },
    );
  }

  @ApiSecurity('X-APP-NAME')
  @Get('introduction/banner')
  async getIntroductionBanner(@AppName() type: EUserRole) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { type },
      { cmd: ConfigController.prototype.getIntroductionBanner.name },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('country')
  async getCountry(@LanguageCode() languageCode: string) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { languageCode },
      { cmd: ConfigController.prototype.getCountry.name },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('city')
  async getCities(@LanguageCode() languageCode: string) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { languageCode },
      { cmd: ConfigController.prototype.getCities.name },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('special-service')
  async getSpecialServices(@LanguageCode() languageCode: string) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { languageCode },
      { cmd: ConfigController.prototype.getSpecialServices.name },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('genders')
  async getGenders(@LanguageCode() languageCode: string) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      languageCode,
      { cmd: ConfigController.prototype.getGenders.name },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('years')
  async getListYears(@LanguageCode() languageCode: string) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      languageCode,
      { cmd: ConfigController.prototype.getListYears.name },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('num-child')
  async getListChild(@LanguageCode() languageCode: string) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      languageCode,
      { cmd: ConfigController.prototype.getListChild.name },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('num-experience')
  async getNumExperience(@LanguageCode() languageCode: string) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      languageCode,
      { cmd: ConfigController.prototype.getNumExperience.name },
    );
  }

  @Get('currency')
  async getCurrency() {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      {},
      { cmd: ConfigController.prototype.getCurrency.name },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('/languages')
  async getConfigLanguages(@LanguageCode() languageCode: string) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      languageCode,
      {
        cmd: ConfigController.prototype.getConfigLanguages.name,
      },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('/enum-age')
  async getEnumFilterAge(@LanguageCode() lang: string) {
    return await this.messageBuilder.sendMessage(EService.CONFIG, lang, {
      cmd: ConfigController.prototype.getEnumFilterAge.name,
    });
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('/enum-rating')
  async getEnumRating(@LanguageCode() lang: string) {
    return await this.messageBuilder.sendMessage(EService.CONFIG, lang, {
      cmd: ConfigController.prototype.getEnumRating.name,
    });
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('/enum-sort/babysitter')
  async getEnumSortBabysitter(@LanguageCode() lang: string) {
    return await this.messageBuilder.sendMessage(EService.CONFIG, lang, {
      cmd: ConfigController.prototype.getEnumSortBabysitter.name,
    });
  }

  @Get('schedule')
  async getSchedule(@Query() { date, scheduleType }: QueryScheduleDto) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { date, scheduleType },
      { cmd: ConfigController.prototype.getSchedule.name },
    );
  }

  @Get('reviews')
  async getReviews() {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      {},
      { cmd: ConfigController.prototype.getReviews.name },
    );
  }

  @Get('conversation/check-list')
  async getConversationCheckList() {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      {},
      {
        cmd: ConfigController.prototype.getConversationCheckList.name,
      },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @ApiSecurity('X-APP-NAME')
  @Get('license')
  async getLicense(@AppName() app: EUserRole, @LanguageCode() lang: string) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { app, lang },
      { 
        cmd: ConfigController.prototype.getLicense.name,
      },
    );
  }

  @Get('info')
  async getConfigInfo() {
    return {
      appVersion: {
        ios: '1.0.0',
        android: '1.0.0',
      },
      apiVersion: '1.0.0',
    };
  }

  @Get('yob-for-child')
  async getYobForChild() {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let i = 0; i <= 6; i++) {
      const year = currentYear - i;
      years.push({
        value: year,
        text: `${year} 년`,
      });
    }

    years.push({
      value: currentYear - 7,
      text: `${currentYear - 7} 년 이전`,
    });

    return years;
  }

  @Get('age-for-child')
  async getAgeOfChild(@Query() query: AgeChildDto) {
    const { yob, mob } = query;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    let age = currentYear - yob;
    let ageText: string;

    if (age < 4) {
      const monthsDiff = (currentYear - yob) * 12 + (currentMonth - mob);
      ageText = `만 ${monthsDiff}개월`;
    } else if (age < 6) {
      if (mob > currentMonth) {
        age--;
      }
      ageText = `만 ${age}세`;
    } else {
      if (mob > currentMonth) {
        age--;
      }
      ageText = `만 ${age}세 이상`;
    }

    return { value: new Date(yob, mob - 1, 1), text: ageText };
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('service-term')
  async getServiceTerms(@LanguageCode() lang: string) {
    return this.messageBuilder.sendMessage(
      EService.CONFIG,
      { lang },
      { cmd: ConfigController.prototype.getServiceTerms.name },
    );
  }
}
