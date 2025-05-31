import { ESearchTerm, EService } from '@lib/common/enums';
import { MessageBuilder } from '@lib/core/message-builder';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class AppService {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  handleMessage(data) {
    const { conversationId, receiver, content, sender, files } = data;
    this.messageBuilder.sendMessage(EService.CHAT, data, {
      cmd: 'createMessage',
    });
    this.messageBuilder.sendMessage(
      EService.NOTIFY,
      { receiver, sender },
      {
        cmd: 'sendNotificationMessage',
      },
    );
    return data;
  }

  async createConversation(data) {
    const { sender, receiver } = data;
    const conversation = await this.messageBuilder.sendMessage(
      EService.CHAT,
      { sender, receiver },
      { cmd: 'createConversation' },
    );
    return conversation;
  }

  async seenMessage(conversationId: string, sender: string): Promise<void> {
    await this.messageBuilder.sendMessage(
      EService.CHAT,
      { id: conversationId, reqUser: { userId: sender } },
      { cmd: AppService.prototype.seenMessage.name },
    );
  }
}
