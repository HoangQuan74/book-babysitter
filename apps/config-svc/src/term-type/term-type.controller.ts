import { Controller } from '@nestjs/common';
import { TermTypeService } from './term-type.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('term-type')
export class TermTypeController {
  constructor(private readonly termTypeService: TermTypeService) {}

  @MessagePattern({
    cmd: TermTypeController.prototype.getTermTypes.name,
  })
  async getTermTypes(data: any) {
    const result = await this.termTypeService.getTermTypes();
    return result;
  }
}
