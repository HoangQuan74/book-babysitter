import { Controller } from '@nestjs/common';
import { ConversationCheckListService } from './conversation-check-list.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('conversation-check-list')
export class ConversationCheckListController {
  constructor(private readonly conversationCheckListService: ConversationCheckListService) {}

  @MessagePattern({
    cmd: ConversationCheckListController.prototype.getConversationCheckList.name,
  })
  async getConversationCheckList() {
    const result = await this.conversationCheckListService.getConversationCheckList();
    return result;
  }
}
