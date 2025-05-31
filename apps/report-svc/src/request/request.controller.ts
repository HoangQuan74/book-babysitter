import { Controller } from '@nestjs/common';
import { RequestService } from './request.service';
import { MessagePattern } from '@nestjs/microservices';
import { IRequestQuery } from '@lib/common/interfaces';

@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @MessagePattern({
    cmd: RequestController.prototype.getRequests.name,
  })
  async getRequests(query: IRequestQuery) {
    return this.requestService.getRequests(query);
  }

  @MessagePattern({
    cmd: RequestController.prototype.getRequestById.name,
  })
  async getRequestById(id: string) {
    return this.requestService.getRequestById(id);
  }
}
