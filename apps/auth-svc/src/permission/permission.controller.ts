import { Controller } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { MessagePattern } from '@nestjs/microservices';
import { IPermission } from '@lib/common/interfaces';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @MessagePattern({
    cmd: PermissionController.prototype.hasPermission.name,
  })
  async hasPermission(permission: IPermission) {
    return this.permissionService.hasPermission(permission);
  }
}
