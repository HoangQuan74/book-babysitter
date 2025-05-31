import { errorMessage, guardScopes } from '@lib/common/constants';
import { EService, EUserRole } from '@lib/common/enums';
import { MessageBuilder } from '@lib/core/message-builder';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly messageBuilder: MessageBuilder,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role === EUserRole.ADMIN) {
      return true;
    }

    const permission = this.reflector.get<any>(
      guardScopes.permission,
      context.getHandler(),
    );

    if (!permission) {
      return true;
    }

    const hasAccess = await this.messageBuilder.sendMessage(
      EService.AUTH,
      { userId: user.userId, permissionName: permission },
      {
        cmd: 'hasPermission',
      },
    );

    if (!hasAccess) {
      throw new ForbiddenException(errorMessage.FORBIDDEN);
    }

    return true;
  }
}
