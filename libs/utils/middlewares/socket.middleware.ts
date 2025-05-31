import { MessageBuilder } from '@lib/core/message-builder';
import { Socket } from 'socket.io';
import { JwtUtil } from '../jwt.util';
import { EService } from '@lib/common/enums';
import { SOCKET_KEY } from '@lib/common/constants';

type WsMiddleware = (socket: any, next: (err?: Error) => void) => void;

export const SocketMiddleware = (
  messageBuilder: MessageBuilder,
): WsMiddleware => {
  return async (socket: Socket, next) => {
    try {
      const token = socket.handshake?.auth?.token;
      if (!token) {
        if (socket.handshake?.auth.key === SOCKET_KEY) {
          return next();
        }
        throw new Error('Missing token');
      }
      let jwtPayload = JwtUtil.decode(token);
      const { secretKey } = await messageBuilder.sendMessage(
        EService.AUTH,
        jwtPayload,
        { cmd: 'getUserSession' },
      );
      if (!secretKey) throw new Error('Unauthorized');

      socket = !!JwtUtil.verify(token, secretKey)
        ? Object.assign(socket, {
            user: jwtPayload,
          })
        : socket;
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  };
};
