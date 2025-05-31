import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { EUserRole } from '../enums';

export const AppName = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const app = request.headers['x-app-name'];
    if (!app) {
      return EUserRole.BABY_SITTER;
    }
    if (!Object.values(EUserRole).includes(app as EUserRole)) {
      throw new BadRequestException('Invalid role in X-APP-NAME header');
    }
    return app;
  },
);
