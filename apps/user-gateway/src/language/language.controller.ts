import { Controller, Get, Post } from '@nestjs/common';
import { LanguageService } from './language.service';
import { MessageBuilder } from '@lib/core/message-builder';
import { ELanguage, EService, EUserRole } from '@lib/common/enums';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  AppName,
  LanguageCode,
  Public,
  RequestUser,
} from '@lib/common/decorator';
import { IRequestUser } from '@lib/common/interfaces';

@ApiBearerAuth()
@Controller('language')
@ApiTags('Config')
export class LanguageController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @Public()
  @ApiSecurity('X-APP-NAME')
  @Get('/')
  async getLanguages(@AppName() app: EUserRole) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { app },
      {
        cmd: LanguageController.prototype.getLanguages.name,
      },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Post('/')
  async saveLanguageSettingLanguage(
    @RequestUser() reqUser: IRequestUser,
    @LanguageCode() lang: ELanguage,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { reqUser, lang },
      {
        cmd: LanguageController.prototype.saveLanguageSettingLanguage.name,
      },
    );
  }
}
