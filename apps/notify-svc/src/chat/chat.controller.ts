import { Controller } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  
  @MessagePattern({
    cmd: ChatController.prototype.sendNotificationMessage.name,
  })
  sendNotificationMessage(payload: { receiver: string, sender: string}) {
    const { receiver, sender } = payload;
    return this.chatService.sendNotificationMessage(receiver, sender);
  }
}
