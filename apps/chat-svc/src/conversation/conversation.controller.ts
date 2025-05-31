import { Controller } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { MessagePattern } from '@nestjs/microservices';
import { IRequestUser } from '@lib/common/interfaces';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @MessagePattern({
    cmd: ConversationController.prototype.getListConversation.name,
  })
  getListConversation(payload: { query: any; reqUser?: IRequestUser }) {
    const { query, reqUser } = payload;
    return this.conversationService.getListConversation(query, reqUser);
  }

  @MessagePattern({
    cmd: ConversationController.prototype.createConversation.name,
  })
  createConversation(data) {
    return this.conversationService.createConversation(data);
  }

  @MessagePattern({
    cmd: ConversationController.prototype.getConversationById.name,
  })
  getConversationById(payload: {
    query?: any;
    conversationId: string;
    reqUser?: IRequestUser;
  }) {
    const { query, conversationId, reqUser } = payload;
    return this.conversationService.getConversationById(
      conversationId,
      query,
      reqUser,
    );
  }

  @MessagePattern({
    cmd: ConversationController.prototype.getConversationByUserId.name,
  })
  getConversationByUserId(payload: { userId: string; reqUser?: IRequestUser }) {
    const { userId, reqUser } = payload;
    return this.conversationService.getConversationByUserId(userId, reqUser);
  }

  @MessagePattern({
    cmd: ConversationController.prototype.toggleMuteConversation.name,
  })
  toggleMuteConversation(payload: { reqUser: IRequestUser; id: string }) {
    const { reqUser, id } = payload;
    return this.conversationService.toggleMuteConversation(reqUser, id);
  }

  @MessagePattern({
    cmd: ConversationController.prototype.togglePinConversation.name,
  })
  togglePinConversation(payload: { reqUser: IRequestUser; id: string }) {
    const { reqUser, id } = payload;
    return this.conversationService.togglePinConversation(reqUser, id);
  }

  @MessagePattern({
    cmd: ConversationController.prototype.deleteConversation.name,
  })
  deleteConversation(payload: { reqUser: IRequestUser; id: string }) {
    const { reqUser, id } = payload;
    return this.conversationService.deleteConversation(id, reqUser);
  }

  @MessagePattern({
    cmd: ConversationController.prototype.getConversationAdminAndUser.name,
  })
  getConversationAdminAndUser(payload: {
    reqUser: IRequestUser;
    userId: string;
  }) {
    const { reqUser, userId } = payload;
    return this.conversationService.getConversationAdminAndUser(
      reqUser,
      userId,
    );
  }
}
