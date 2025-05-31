import { Controller } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @MessagePattern({
    cmd: ResourceController.prototype.getResources.name,
  })
  async getResources(languageCode: string) {
    return this.resourceService.getResources(languageCode);
  }
}
