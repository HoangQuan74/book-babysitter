import { SOCKET_KEY } from '@lib/common/constants';
import { EBookingStatus, EGateway, ESocketEvents } from '@lib/common/enums';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { io, Socket } from 'socket.io-client';

@Injectable()
export class SocketClientService {
  private socket: Socket;

  constructor(private readonly configService: ConfigService) {
    this.initializeSocket();
  }

  private initializeSocket() {
    const { host, port } = this.configService.get(EGateway.SOCKET);
    this.socket = io(`${host}:${port}`, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 5000,
      auth: {
        key: SOCKET_KEY,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket gateway');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  async ensureConnected(): Promise<void> {
    if (this.socket.connected) {
      return;
    }
    this.initializeSocket();
  }

  async emitBookingStatusChange(data: {
    parentId: string;
    babysitterId: string;
    type: EBookingStatus | string;
  }) {
    await this.ensureConnected();
    this.socket.emit(ESocketEvents.BOOKING, data);
  }
}
