import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { MessageBuilder } from '@lib/core/message-builder';
import {
  ELanguage,
  EService,
  ETermDisplayStatus,
  EUserRole,
} from '@lib/common/enums';
import { CreateTermDto } from './dto/create-term.dto';
import { TermQueryDto } from './dto/query-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { CreateIntroductionImagesDto, QueryIntroductionImageDto } from './dto';
import { LanguageCode, Public, RequestUser } from '@lib/common/decorator';
import { IRequestUser } from '@lib/common/interfaces';
import {
  CreateIntroductionBannerDto,
  CreateSpecialServiceDto,
  CurrenciesDto,
  NotificationBackgroundDto,
  QueryCountryDto,
  QueryIntroductionBannerDto,
  UpsertCountryDto,
} from './dto';
import { errorMessage } from '@lib/common/constants';
import { ENotificationBackgroundType } from '@lib/core/databases/postgres/entities/notification-background.entity';
@ApiBearerAuth()
@ApiTags('Config')
@Controller('config')
export class ConfigController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @Get('terms')
  async getTerms(@Query() query: TermQueryDto) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { query },
      { cmd: ConfigController.prototype.getTerms.name },
    );
  }

  @Post('terms')
  async saveTerm(@Body() data: CreateTermDto) {
    if (!data.displayStatus) data.displayStatus = ETermDisplayStatus.DISPLAY;
    return await this.messageBuilder.sendMessage(EService.CONFIG, data, {
      cmd: ConfigController.prototype.saveTerm.name,
    });
  }

  @Patch('terms/:id')
  async updateTerm(@Param('id') id: string, @Body() term: UpdateTermDto) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { id, term },
      {
        cmd: ConfigController.prototype.updateTerm.name,
      },
    );
  }

  @Get('terms/meta-data')
  async getTermMetaData() {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      {},
      { cmd: ConfigController.prototype.getTermMetaData.name },
    );
  }

  @Get('terms/:id')
  async getTermDetail(@Param('id') id: string) {
    return await this.messageBuilder.sendMessage(EService.CONFIG, id, {
      cmd: ConfigController.prototype.getTermDetail.name,
    });
  }

  @Get('introduction-image')
  async getIntroductionImage(@Query() { type }: QueryIntroductionImageDto) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { type },
      { cmd: ConfigController.prototype.getIntroductionImage.name },
    );
  }

  @Post('introduction-image')
  async saveIntroductionImage(
    @Body() data: CreateIntroductionImagesDto,
    @RequestUser() reqUser: IRequestUser,
  ) {
    const { images, type } = data;
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { images, type, reqUser },
      {
        cmd: ConfigController.prototype.saveIntroductionImage.name,
      },
    );
  }

  @Get('introduction-banner')
  async getIntroductionBanner(@Query() { type }: QueryIntroductionBannerDto) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { type },
      { cmd: ConfigController.prototype.getIntroductionBanner.name },
    );
  }

  @Post('introduction-banner')
  async saveIntroductionBanner(
    @Body() data: CreateIntroductionBannerDto,
    @RequestUser() reqUser: IRequestUser,
  ) {
    const { images } = data;
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { images, reqUser },
      {
        cmd: ConfigController.prototype.saveIntroductionBanner.name,
      },
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

  @Post('currency')
  async saveCurrency(@Body() { currencies }: CurrenciesDto) {
    return await this.messageBuilder.sendMessage(EService.CONFIG, currencies, {
      cmd: ConfigController.prototype.saveCurrency.name,
    });
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

  @Public()
  @Get('language/setting')
  async getLanguages() {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      {},
      {
        cmd: ConfigController.prototype.getLanguages.name,
      },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Post('language/setting')
  async saveLanguageSettingLanguage(
    @RequestUser() reqUser: IRequestUser,
    @LanguageCode() lang: ELanguage,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { reqUser, lang },
      {
        cmd: ConfigController.prototype.saveLanguageSettingLanguage.name,
      },
    );
  }

  @Get('special-service')
  async getSpecialServices(@Query('langCode') languageCode: string) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { languageCode },
      { cmd: ConfigController.prototype.getSpecialServices.name },
    );
  }

  @Post('special-service')
  createSpecialService(@Body() body: CreateSpecialServiceDto) {
    return this.messageBuilder.sendMessage(EService.CONFIG, body, {
      cmd: ConfigController.prototype.createSpecialService.name,
    });
  }

  @Delete('special-service/:id')
  deleteSpecialService(@Param('id') id: string) {
    return this.messageBuilder.sendMessage(
      EService.CONFIG,
      { id },
      {
        cmd: ConfigController.prototype.deleteSpecialService.name,
      },
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
  @Post('country')
  async upsertCountry(@Body() { countries }: UpsertCountryDto) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { countries },
      { cmd: ConfigController.prototype.upsertCountry.name },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('city')
  async getCities(
    @LanguageCode() languageCode: string,
    @Query() { countryId, isUserCreated }: QueryCountryDto,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { languageCode, countryId, isUserCreated },
      { cmd: ConfigController.prototype.getCities.name },
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

  @Get('notification-background/:type')
  @ApiParam({
    name: 'type',
    enum: ENotificationBackgroundType,
    description: 'Type of notification background',
    required: true,
  })
  async getNotificationBackground(
    @Param('type') type: ENotificationBackgroundType,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { type },
      { cmd: ConfigController.prototype.getNotificationBackground.name },
    );
  }

  @Post('notification-background')
  async createNotificationBackground(@Body() data: NotificationBackgroundDto) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { data },
      {
        cmd: ConfigController.prototype.createNotificationBackground.name,
      },
    );
  }
}
