import { Controller } from '@nestjs/common';
import { DeviceService } from './device.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @MessagePattern({
    cmd: DeviceController.prototype.createUserDevice.name,
  })
  createUserDevice(data) {
    return this.deviceService.createUserDevice(data);
  }
}
