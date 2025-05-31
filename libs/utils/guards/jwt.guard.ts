import { guardScopes } from '@lib/common/constants';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtUtil } from '../jwt.util';
import { EService } from '@lib/common/enums';
import { MessageBuilder } from '@lib/core/message-builder';
import { IJwtPayload } from '@lib/common/interfaces';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly messageBuilder: MessageBuilder,
    private reflector: Reflector,
  ) {}

  private async validateRequest(request): Promise<IJwtPayload | boolean> {
    const headers = request.headers;
    const token = headers['authorization'] || null;
    if (!token) return false;
    const parsedToken = this.parseJwtHeader(token);
    const jwtPayload: any = JwtUtil.decode(parsedToken);
    try {
      const { secretKey } = await this.messageBuilder.sendMessage(
        EService.AUTH,
        jwtPayload,
        { cmd: 'getUserSession' },
      );

      if (!secretKey) return false;

      return !!JwtUtil.verify(parsedToken, secretKey)
        ? Object.assign(jwtPayload)
        : null;
    } catch (e) {
      return null;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        guardScopes.isPublic,
        [context.getHandler(), context.getClass()],
      );
      if (isPublic) return true;

      const request = context.switchToHttp().getRequest();

      const jwtPayload = await this.validateRequest(request);
      if (!jwtPayload) throw new UnauthorizedException();

      request.user = jwtPayload;

      return true;
    } catch (error) {
      console.error(error.message);
      throw new UnauthorizedException();
    }
  }

  parseJwtHeader(authHeader: string) {
    let jwt: string = authHeader;
    const authHeaderParts = (authHeader as string).split(' ');
    if (authHeaderParts.length == 2) {
      const [, jwtParse] = authHeaderParts;
      jwt = jwtParse;
    }
    return jwt;
  }
}
