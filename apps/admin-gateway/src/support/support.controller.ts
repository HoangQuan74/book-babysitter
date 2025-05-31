import { MessageBuilder } from '@lib/core/message-builder';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AnswerRequestReportDto,
  CreateFaqDto,
  FaqQueryDto,
  RequestQueryDto,
  UpdateFaqDto,
  UpdateRequestContactDto,
} from './dto';
import { EService } from '@lib/common/enums';
import { AnswerQuestionDto } from './dto/request-question.dto';
import { RequestUser } from '@lib/common/decorator';
import { IRequestUser } from '@lib/common/interfaces';

@ApiBearerAuth()
@ApiTags('Support')
@Controller('support')
export class SupportController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @Get('faqs')
  async getFaqs(@Query() query: FaqQueryDto) {
    return await this.messageBuilder.sendMessage(EService.CONFIG, query, {
      cmd: SupportController.prototype.getFaqs.name,
    });
  }

  @Get('faqs/:id')
  async getFaqById(@Param('id') id: string) {
    return await this.messageBuilder.sendMessage(EService.CONFIG, id, {
      cmd: SupportController.prototype.getFaqById.name,
    });
  }

  @Post('faqs')
  async createFaq(@Body() data: CreateFaqDto) {
    return await this.messageBuilder.sendMessage(EService.CONFIG, data, {
      cmd: SupportController.prototype.createFaq.name,
    });
  }

  @Patch('faqs')
  async updateFaq(@Body() data: UpdateFaqDto) {
    return await this.messageBuilder.sendMessage(EService.CONFIG, data, {
      cmd: SupportController.prototype.updateFaq.name,
    });
  }

  @Get('requests')
  async getRequests(@Query() query: RequestQueryDto) {
    return await this.messageBuilder.sendMessage(EService.REPORT, query, {
      cmd: SupportController.prototype.getRequests.name,
    });
  }

  @Get('requests/:id')
  async getRequestById(@Param('id') id: string) {
    return await this.messageBuilder.sendMessage(EService.REPORT, id, {
      cmd: SupportController.prototype.getRequestById.name,
    });
  }

  @Patch('request-contact')
  async updateRequestContact(@Body() data: UpdateRequestContactDto) {
    return await this.messageBuilder.sendMessage(EService.REPORT, data, {
      cmd: SupportController.prototype.updateRequestContact.name,
    });
  }

  @Patch('request-absence')
  async updateRequestAbsence(@Body() data: UpdateRequestContactDto) {
    return await this.messageBuilder.sendMessage(EService.REPORT, data, {
      cmd: SupportController.prototype.updateRequestAbsence.name,
    });
  }

  @Patch('request-report')
  async answerRequestReport(
    @RequestUser() reqUser: IRequestUser,
    @Body() data: AnswerRequestReportDto,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.REPORT,
      { reqUser, data },
      {
        cmd: SupportController.prototype.answerRequestReport.name,
      },
    );
  }

  @Post('request-question')
  async createRequestQuestion(
    @RequestUser() reqUser: IRequestUser,
    @Body() data: AnswerQuestionDto,
  ) {
    return await this.messageBuilder.sendMessage(
      EService.REPORT,
      { reqUser, data },
      {
        cmd: SupportController.prototype.createRequestQuestion.name,
      },
    );
  }
}
