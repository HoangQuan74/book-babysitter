import { Controller } from '@nestjs/common';
import { TermPolicyService } from './term-policy.service';
import { MessagePattern } from '@nestjs/microservices';
import { ICreateTerm } from '@lib/common/interfaces';
import { ELanguage } from '@lib/common/enums';

@Controller('term-policy')
export class TermPolicyController {
  constructor(private readonly termPolicyService: TermPolicyService) {}

  @MessagePattern({
    cmd: TermPolicyController.prototype.getTerms.name,
  })
  async getTerms(data: any) {
    const query = data.query;
    const result = await this.termPolicyService.getTerms(query);
    return result;
  }

  @MessagePattern({
    cmd: TermPolicyController.prototype.getTermDetail.name,
  })
  async getTermDetail(id: string) {
    return await this.termPolicyService.getTermDetail(id);
  }

  @MessagePattern({
    cmd: TermPolicyController.prototype.saveTerm.name,
  })
  async saveTerm(data: ICreateTerm) {
    const result = await this.termPolicyService.saveTerm(data);
    return result;
  }

  @MessagePattern({
    cmd: TermPolicyController.prototype.updateTerm.name,
  })
  async updateTerm(data: any) {
    const { id, term } = data;
    const result = await this.termPolicyService.updateTerm(id, term);
    return result;
  }

  @MessagePattern({
    cmd: TermPolicyController.prototype.getTermUser.name,
  })
  async getTermUser(lang: ELanguage) {
    const result = await this.termPolicyService.getTermUser(lang);
    return result;
  }

  @MessagePattern({
    cmd: TermPolicyController.prototype.getTermMetaData.name,
  })
  async getTermMetaData() {
    const result = await this.termPolicyService.getTermMetaData();
    return result;
  }

  @MessagePattern({
    cmd: TermPolicyController.prototype.getServiceTerms.name,
  })
  async getServiceTerms() {
    return this.termPolicyService.getServiceTerms();
  }
}
