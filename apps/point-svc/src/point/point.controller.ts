import { Controller } from '@nestjs/common';
import { PointService } from './point.service';
import { MessagePattern } from '@nestjs/microservices';
import { IAddPoint } from '@lib/common/interfaces';

@Controller('point')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @MessagePattern({
    cmd: PointController.prototype.addPoint.name,
  })
  async addPoint(data: IAddPoint) {
    return this.pointService.addPoint(data);
  }
}
