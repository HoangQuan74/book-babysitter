import { Controller } from '@nestjs/common';
import { FaqService } from './faq.service';
import { MessagePattern } from '@nestjs/microservices';
import {
  ICreateFaq,
  IFaqQuery,
  IRequestUser,
  IUpdateFaq,
} from '@lib/common/interfaces';
import { ELanguage } from '@lib/common/enums';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @MessagePattern({
    cmd: FaqController.prototype.getFaqs.name,
  })
  async getFaqs(query: IFaqQuery) {
    return await this.faqService.getFaqs(query);
  }

  @MessagePattern({
    cmd: FaqController.prototype.getFaqById.name,
  })
  async getFaqById(id: string) {
    return await this.faqService.getFaqById(id);
  }

  @MessagePattern({
    cmd: FaqController.prototype.createFaq.name,
  })
  async createFaq(data: ICreateFaq) {
    return this.faqService.createFaq(data);
  }

  @MessagePattern({
    cmd: FaqController.prototype.updateFaq.name,
  })
  async updateFaq(data: IUpdateFaq) {
    return this.faqService.updateFaq(data);
  }

  @MessagePattern({
    cmd: FaqController.prototype.getUserFaqs.name,
  })
  async getUserFaqs({
    reqUser,
    LanguageCode,
  }: {
    reqUser: IRequestUser;
    LanguageCode: ELanguage;
  }) {
    return await this.faqService.getUserFaqs(reqUser, LanguageCode);
  }
}
