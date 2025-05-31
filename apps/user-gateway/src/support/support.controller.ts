import { LanguageCode, RequestUser } from '@lib/common/decorator';
import { ELanguage, EService } from '@lib/common/enums';
import { IRequestUser } from '@lib/common/interfaces';
import { MessageBuilder } from '@lib/core/message-builder';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  ReportDto,
  RequestAbsenceDto,
  RequestContactDto,
  RequestQuestionDto,
} from './dto';

@ApiBearerAuth()
@ApiTags('Support')
@Controller('support')
export class SupportController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @ApiSecurity('X-LANG-CODE')
  @Get('faqs')
  async getUserFaqs(
    @RequestUser() reqUser: IRequestUser,
    @LanguageCode() languageCode: ELanguage,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.CONFIG,
      { reqUser, languageCode },
      {
        cmd: SupportController.prototype.getUserFaqs.name,
      },
    );
  }

  @Post('request-contact')
  async createRequestContact(
    @RequestUser() reqUser: IRequestUser,
    @Body() { phone }: RequestContactDto,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.REPORT,
      { reqUser, phone },
      {
        cmd: SupportController.prototype.createRequestContact.name,
      },
    );
  }

  @Post('request-report')
  async createRequestReport(
    @RequestUser() reqUser: IRequestUser,
    @Body() data: ReportDto,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.REPORT,
      { reqUser, data },
      {
        cmd: SupportController.prototype.createRequestReport.name,
      },
    );
  }

  @Post('request-absence')
  async createRequestAbsence(
    @RequestUser() reqUser: IRequestUser,
    @Body() { bookingId }: RequestAbsenceDto,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.REPORT,
      { reqUser, bookingId },
      {
        cmd: SupportController.prototype.createRequestAbsence.name,
      },
    );
  }

  @Post('request-question')
  async createRequestQuestion(
    @RequestUser() reqUser: IRequestUser,
    @Body() data: RequestQuestionDto,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.REPORT,
      { reqUser, data },
      {
        cmd: SupportController.prototype.createRequestQuestion.name,
      },
    );
  }

  @Get('request-question')
  async getRequestQuestions(@RequestUser() reqUser: IRequestUser) {
    return await this.messageBuilder.sendMessage(EService.REPORT, reqUser, {
      cmd: SupportController.prototype.getRequestQuestions.name,
    });
  }

  @Get('request-question/:id')
  async getRequestById(@Param('id') id: string) {
    return await this.messageBuilder.sendMessage(EService.REPORT, id, {
      cmd: SupportController.prototype.getRequestById.name,
    });
  }

  @Patch('request-question/read/:id')
  async readRequestQuestion(
    @Param('id') id: string,
    @RequestUser() reqUser: IRequestUser,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.REPORT,
      { reqUser, id },
      {
        cmd: SupportController.prototype.readRequestQuestion.name,
      },
    );
  }

  @Patch('/request-question/complete/:id')
  async setRequestQuestionToSuccess(@Param('id') id: string) {
    return await this.messageBuilder.sendMessage(EService.REPORT, id, {
      cmd: SupportController.prototype.setRequestQuestionToSuccess.name,
    });
  }
}
