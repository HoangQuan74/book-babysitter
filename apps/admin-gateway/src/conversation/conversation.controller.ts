import { Controller, Get, Param, Query } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QueryConversationDto } from './dto';
import { MessageBuilder } from '@lib/core/message-builder';
import { EService } from '@lib/common/enums';
import { RequestUser } from '@lib/common/decorator';
import { IRequestUser } from '@lib/common/interfaces';

@ApiBearerAuth()
@Controller('conversation')
@ApiTags('Conversation')
export class ConversationController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @Get('list')
  getListConversation(@Query() query: QueryConversationDto) {
    return this.messageBuilder.sendMessage(
      EService.CHAT,
      { query },
      {
        cmd: ConversationController.prototype.getListConversation.name,
      },
    );
  }

  @Get(':conversationId')
  getConversationMessage(@Param('conversationId') conversationId: string) {
    return this.messageBuilder.sendMessage(
      EService.CHAT,
      { conversationId },
      {
        cmd: ConversationController.prototype.getConversationMessage.name,
      },
    );
  }

  @Get('user/:userId')
  getConversationAdminAndUser(
    @Param('userId') userId: string,
    @RequestUser() reqUser: IRequestUser,
  ) {
    return this.messageBuilder.sendMessage(
      EService.CHAT,
      { reqUser, userId },
      {
        cmd: ConversationController.prototype.getConversationAdminAndUser.name,
      },
    );
  }
}
