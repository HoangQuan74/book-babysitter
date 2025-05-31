import { Controller } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessagePattern } from '@nestjs/microservices';
import { IRequestUser } from '@lib/common/interfaces';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @MessagePattern({
    cmd: MessageController.prototype.createMessage.name,
  })
  createMessage(data) {
    return this.messageService.createMessage(data);
  }

  @MessagePattern({
    cmd: MessageController.prototype.getConversationMessage.name,
  })
  getConversationMessage(data) {
    return this.messageService.getConversationMessage(data);
  }

  @MessagePattern({
    cmd: MessageController.prototype.seenMessage.name,
  })
  seenMessage(payload: { id: string; reqUser: IRequestUser }) {
    const { id, reqUser } = payload;
    return this.messageService.seenMessage(id, reqUser);
  }
}
