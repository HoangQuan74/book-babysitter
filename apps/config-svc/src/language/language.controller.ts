import { Controller } from '@nestjs/common';
import { LanguageService } from './language.service';
import { MessagePattern } from '@nestjs/microservices';
import { IRequestUser } from '@lib/common/interfaces';
import { EUserRole } from '@lib/common/enums';

@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @MessagePattern({
    cmd: LanguageController.prototype.getConfigLanguages.name,
  })
  async getConfigLanguages(languageCode: string) {
    const result = await this.languageService.getConfigLanguages(languageCode);
    return result;
  }

  @MessagePattern({
    cmd: LanguageController.prototype.getLanguages.name,
  })
  async getLanguages(payload: { app: EUserRole }) {
    const { app } = payload;
    const result = await this.languageService.getLanguages(app);
    return result;
  }

  @MessagePattern({
    cmd: LanguageController.prototype.saveLanguageSettingLanguage.name,
  })
  saveLanguageSettingLanguage({
    reqUser,
    lang,
  }: {
    reqUser: IRequestUser;
    lang: string;
  }) {
    return this.languageService.saveLanguageSettingLanguage(reqUser, lang);
  }
}
