import { Controller } from '@nestjs/common';
import { RequestContactService } from './request-contact.service';
import { MessagePattern } from '@nestjs/microservices';
import { IRequestUser, IUpdateRequest } from '@lib/common/interfaces';

@Controller('request-contact')
export class RequestContactController {
  constructor(private readonly requestContactService: RequestContactService) {}

  @MessagePattern({
    cmd: RequestContactController.prototype.createRequestContact.name,
  })
  async createRequestContact({
    reqUser,
    phone,
  }: {
    reqUser: IRequestUser;
    phone: string;
  }) {
    return this.requestContactService.createRequestContact(reqUser, phone);
  }

  @MessagePattern({
    cmd: RequestContactController.prototype.updateRequestContact.name,
  })
  async updateRequestContact(data: IUpdateRequest) {
    return this.requestContactService.updateRequestContact(data);
  }
}
