import { Controller } from '@nestjs/common';
import { RequestAbsenceService } from './request-absence.service';
import { MessagePattern } from '@nestjs/microservices';
import { IRequestUser, IUpdateRequest } from '@lib/common/interfaces';

@Controller('request-absence')
export class RequestAbsenceController {
  constructor(private readonly requestAbsenceService: RequestAbsenceService) {}

  @MessagePattern({
    cmd: RequestAbsenceController.prototype.createRequestAbsence.name,
  })
  async createRequestAbsence(payload: {
    reqUser: IRequestUser;
    bookingId: string;
  }) {
    const { reqUser, bookingId } = payload;
    return this.requestAbsenceService.createRequestAbsence(reqUser, bookingId);
  }

    @MessagePattern({
      cmd: RequestAbsenceController.prototype.updateRequestAbsence.name,
    })
    async updateRequestAbsence(data: IUpdateRequest) {
      return this.requestAbsenceService.updateRequestAbsence(data);
    }
}
