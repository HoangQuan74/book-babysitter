import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MessageBuilder } from '@lib/core/message-builder';
import { RequestUser } from '@lib/common/decorator';
import { EService } from '@lib/common/enums';
import { CreateCommentDto } from './dto';
import { PaginationQueryDto } from '@lib/common/query';

@Controller('comment')
@ApiTags('Comment')
@ApiBearerAuth()
export class CommentController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @Post('create')
  createComment(@RequestUser() user, @Body() body: CreateCommentDto) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { user, body },
      { cmd: CommentController.prototype.createComment.name },
    );
  }

  @Get('me')
  getMyCommentsOnPosts(
    @RequestUser() reqUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { reqUser, query },
      { cmd: CommentController.prototype.getMyCommentsOnPosts.name },
    );
  }
}
