import { Controller } from '@nestjs/common';
import { RequestQuestionService } from './request-question.service';
import { IRequestQuestion, IRequestUser } from '@lib/common/interfaces';
import { MessagePattern } from '@nestjs/microservices';

@Controller('request-question')
export class RequestQuestionController {
  constructor(
    private readonly requestQuestionService: RequestQuestionService,
  ) {}

  @MessagePattern({
    cmd: RequestQuestionController.prototype.createRequestQuestion.name,
  })
  async createRequestQuestion({
    reqUser,
    data,
  }: {
    reqUser: IRequestUser;
    data: IRequestQuestion;
  }) {
    return this.requestQuestionService.createRequestQuestion(reqUser, data);
  }

  @MessagePattern({
    cmd: RequestQuestionController.prototype.setRequestQuestionToSuccess.name,
  })
  async setRequestQuestionToSuccess(id: string) {
    return this.requestQuestionService.setRequestQuestionToSuccess(id);
  }

  @MessagePattern({
    cmd: RequestQuestionController.prototype.getRequestQuestions.name,
  })
  async getRequestQuestions(reqUser: IRequestUser) {
    return this.requestQuestionService.getRequestQuestions(reqUser);
  }

  @MessagePattern({
    cmd: RequestQuestionController.prototype.readRequestQuestion.name,
  })
  async readRequestQuestion({
    reqUser,
    id,
  }: {
    reqUser: IRequestUser;
    id: string;
  }) {
    return this.requestQuestionService.readRequestQuestion(reqUser, id);
  }
}
