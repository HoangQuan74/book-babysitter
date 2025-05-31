import { Controller } from '@nestjs/common';
import { RequestReportService } from './request-report.service';
import { MessagePattern } from '@nestjs/microservices';
import { IRequestReport, IRequestUser } from '@lib/common/interfaces';

@Controller('request-report')
export class RequestReportController {
  constructor(private readonly requestReportService: RequestReportService) {}

  @MessagePattern({
    cmd: RequestReportController.prototype.createRequestReport.name,
  })
  async createRequestReport({
    reqUser,
    data,
  }: {
    reqUser: IRequestUser;
    data: IRequestReport;
  }) {
    return this.requestReportService.createRequestReport(reqUser, data);
  }

  @MessagePattern({
    cmd: RequestReportController.prototype.answerRequestReport.name,
  })
  async answerRequestReport({
    reqUser,
    data,
  }: {
    reqUser: IRequestUser;
    data: IRequestReport;
  }) {
    return this.requestReportService.answerRequestReport(reqUser, data);
  }
}
