import { Controller } from '@nestjs/common';
import { SpecialServiceService } from './special-service.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('special-service')
export class SpecialServiceController {
  constructor(private readonly specialServiceService: SpecialServiceService) {}

  @MessagePattern({
    cmd: SpecialServiceController.prototype.getSpecialServices.name,
  })
  async getSpecialServices(data) {
    const result = await this.specialServiceService.getSpecialServices(data);
    return result;
  }

  @MessagePattern({
    cmd: SpecialServiceController.prototype.createSpecialService.name,
  })
  async createSpecialService(data) {
    const result = await this.specialServiceService.createSpecialService(data);
    return result;
  }

  @MessagePattern({
    cmd: SpecialServiceController.prototype.deleteSpecialService.name,
  })
  async deleteSpecialService(data) {
    const result = await this.specialServiceService.deleteSpecialService(data);
    return result;
  }
}
