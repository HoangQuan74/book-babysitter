import { Server, Socket } from 'socket.io';
import { AppService } from './app.service';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { SocketMiddleware } from '@lib/utils/middlewares';
import { MessageBuilder } from '@lib/core/message-builder';
import { EService, ESocketEvents } from '@lib/common/enums';
import { AwsClientService } from '@lib/utils/aws-client/aws-client.service';
import { isEmpty } from 'lodash';
import { SOCKET_KEY } from '@lib/common/constants';

interface ISocketClient extends Socket {
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppController
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly connectedClients: Map<string, Socket> = new Map();
  constructor(
    private readonly configService: ConfigService,
    private readonly appService: AppService,
    private readonly messageBuilder: MessageBuilder,
    private readonly awsClientService: AwsClientService,
  ) {}

  afterInit(@ConnectedSocket() socket: Socket) {
    socket.use(SocketMiddleware(this.messageBuilder));
  }

  handleDisconnect(client: ISocketClient) {
    const clientId = client?.user?.id ?? SOCKET_KEY;
    this.connectedClients.delete(clientId);
  }

  handleConnection(client: ISocketClient) {
    const clientId = client?.user?.userId ?? SOCKET_KEY;
    this.connectedClients.set(clientId, client);
  }

  @SubscribeMessage(ESocketEvents.MESSAGE)
  async handleMessage(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() data,
  ) {
    const { conversationId, to: receiver, content, files } = data;
    const sender = client.user.userId;
    const receiverClient = this.connectedClients.get(receiver);

    let fileUrls = [];
    let urlResults = [];
    if (!isEmpty(files)) {
      urlResults = await this.awsClientService.createS3PresignedUrlList(
        client.user,
        files,
      );
      fileUrls = urlResults.map((file) => file.url);
    }

    if (receiverClient) {
      this.server.to(receiverClient.id).emit(ESocketEvents.MESSAGE, {
        sender,
        content,
        conversationId,
        files: fileUrls,
      });
      this.server
        .to(receiverClient.id)
        .emit(ESocketEvents.NEW_MESSAGE, ESocketEvents.NEW_MESSAGE);
    }

    const senderClient = this.connectedClients.get(sender);
    if (senderClient) {
      this.server.to(senderClient.id).emit(ESocketEvents.MESSAGE, {
        sender,
        content,
        conversationId,
        files: urlResults?.map((file) => file.urlPresigned),
      });
      this.server
        .to(senderClient.id)
        .emit(ESocketEvents.NEW_MESSAGE, ESocketEvents.NEW_MESSAGE);
    }

    return this.appService.handleMessage({
      conversationId,
      receiver,
      content,
      sender,
      files: urlResults,
    });
  }

  @SubscribeMessage(ESocketEvents.TYPING)
  handleTyping(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() data,
  ): void {
    const { to: receiver } = data;
    const sender = client.user.userId;
    const receiverClient = this.connectedClients.get(receiver);
    if (receiverClient) {
      this.server.to(receiverClient.id).emit(ESocketEvents.TYPING, { sender });
    }
  }

  @SubscribeMessage(ESocketEvents.SEEN)
  async handleSeen(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody() data: { to: string; conversationId: string },
  ): Promise<void> {
    const { to: receiver, conversationId } = data;
    const sender = client.user.userId;
    const receiverClient = this.connectedClients.get(receiver);
    if (receiverClient) {
      this.server
        .to(receiverClient.id)
        .emit(ESocketEvents.SEEN, { sender, conversationId });
    }
    await this.appService.seenMessage(conversationId, sender);
  }

  @SubscribeMessage(ESocketEvents.BOOKING)
  async handleBooking(
    @ConnectedSocket() client: ISocketClient,
    @MessageBody()
    data: { parentId: string; babysitterId: string; type: string },
  ): Promise<void> {
    const { parentId, babysitterId, type } = data;

    const parentClient = this.connectedClients.get(parentId);
    const babysitterClient = this.connectedClients.get(babysitterId);

    if (parentClient) {
      this.server.to(parentClient.id).emit(ESocketEvents.BOOKING, { type });
    }

    if (babysitterClient) {
      this.server.to(babysitterClient.id).emit(ESocketEvents.BOOKING, { type });
    }
  }
}
