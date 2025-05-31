import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MessageBuilder } from '@lib/core/message-builder';
import { EService } from '@lib/common/enums';
import { ConversationQueryDto, CreateConversationDto } from './dto';
import { RequestUser } from '@lib/common/decorator';
import { query } from 'express';
import { IRequestUser } from '@lib/common/interfaces';
import { PaginationQueryDto } from '@lib/common/query';

@Controller('conversation')
@ApiTags('Conversation')
@ApiBearerAuth()
export class ConversationController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @Get()
  getListConversation(
    @RequestUser() reqUser,
    @Query() query: ConversationQueryDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.CHAT,
      { reqUser, query },
      {
        cmd: ConversationController.prototype.getListConversation.name,
      },
    );
  }
  @Post('/create')
  createConversation(@RequestUser() user, @Body() body: CreateConversationDto) {
    return this.messageBuilder.sendMessage(
      EService.CHAT,
      { user, body },
      {
        cmd: ConversationController.prototype.createConversation.name,
      },
    );
  }
  @Get('/message/:id')
  getConversationById(
    @Query() query: ConversationQueryDto,
    @Param('id') conversationId: string,
    @RequestUser() reqUser: IRequestUser,
  ) {
    return this.messageBuilder.sendMessage(
      EService.CHAT,
      { query, conversationId, reqUser },
      { cmd: ConversationController.prototype.getConversationById.name },
    );
  }

  @Patch('/seen/:id')
  seenMessage(@Param('id') id: string, @RequestUser() reqUser: IRequestUser) {
    return this.messageBuilder.sendMessage(
      EService.CHAT,
      { id, reqUser },
      { cmd: ConversationController.prototype.seenMessage.name },
    );
  }

  @Get('user/:userId')
  getConversationByUserId(
    @Param('userId') userId: string,
    @RequestUser() reqUser: IRequestUser,
  ) {
    return this.messageBuilder.sendMessage(
      EService.CHAT,
      { userId, reqUser },
      { cmd: ConversationController.prototype.getConversationByUserId.name },
    );
  }

  @Get('system')
  getConversationAdminAndUser(@RequestUser() reqUser: IRequestUser) {
    return this.messageBuilder.sendMessage(
      EService.CHAT,
      { reqUser, userId: reqUser.userId },
      {
        cmd: ConversationController.prototype.getConversationAdminAndUser.name,
      },
    );
  }

  @Get('booking/:partnerId')
  getBookingConfirmOfConversation(
    @Param('partnerId') partnerId: string,
    @RequestUser() reqUser: IRequestUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.BOOKING,
      { partnerId, reqUser, query },
      {
        cmd: ConversationController.prototype.getBookingConfirmOfConversation
          .name,
      },
    );
  }

  @Post('toggle-mute/:id')
  toggleMuteConversation(
    @RequestUser() reqUser: IRequestUser,
    @Param('id') id: string,
  ) {
    return this.messageBuilder.sendMessage(
      EService.CHAT,
      { reqUser, id },
      { cmd: ConversationController.prototype.toggleMuteConversation.name },
    );
  }

  @Post('toggle-pin/:id')
  togglePinConversation(
    @RequestUser() reqUser: IRequestUser,
    @Param('id') id: string,
  ) {
    return this.messageBuilder.sendMessage(
      EService.CHAT,
      { reqUser, id },
      { cmd: ConversationController.prototype.togglePinConversation.name },
    );
  }

  @Delete(':id')
  deleteConversation(
    @Param('id') id: string,
    @RequestUser() reqUser: IRequestUser,
  ) {
    return this.messageBuilder.sendMessage(
      EService.CHAT,
      { reqUser, id },
      { cmd: ConversationController.prototype.deleteConversation.name },
    );
  }
}
