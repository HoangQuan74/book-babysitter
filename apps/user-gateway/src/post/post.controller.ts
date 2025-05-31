import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { MessageBuilder } from '@lib/core/message-builder';
import { EService } from '@lib/common/enums';
import { LanguageCode, Public, RequestUser } from '@lib/common/decorator';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  CreatePostDto,
  QueryMyPostDto,
  QueryPostCommentDto,
  QueryPostDetail,
  QueryPostDto,
  ReactPostDto,
  UpdatePostDto,
} from './dto';
import { query } from 'express';
import { IRequestUser } from '@lib/common/interfaces';
import { PaginationQueryDto } from '@lib/common/query';
import { userInfo } from 'os';

@Controller('post')
@ApiTags('Post')
@ApiBearerAuth()
export class PostController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @ApiSecurity('X-LANG-CODE')
  @Get('category')
  getPostCategory(@LanguageCode() languageCode: string) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { languageCode },
      {
        cmd: PostController.prototype.getPostCategory.name,
      },
    );
  }

  @Post('create')
  createPost(@RequestUser() user, @Body() body: CreatePostDto) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { body, user },
      {
        cmd: PostController.prototype.createPost.name,
      },
    );
  }

  @Get('/notification/list')
  getNotificationPostList(
    @RequestUser() reqUser: IRequestUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { reqUser, query },
      {
        cmd: PostController.prototype.getNotificationPostList.name,
      },
    );
  }
  @ApiSecurity('X-LANG-CODE')
  @Get('list')
  getListUserPost(
    @RequestUser() reqUser: IRequestUser,
    @Query() quey: QueryPostDto,
    @LanguageCode() languageCode: string,
  ) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { ...quey, languageCode, ...reqUser },
      {
        cmd: PostController.prototype.getListUserPost.name,
      },
    );
  }

  @Get('list/:userId')
  getListUserPostByUserId(
    @Param('userId') userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { query, userId },
      {
        cmd: PostController.prototype.getListUserPostByUserId.name,
      },
    );
  }

  @Get('search/history')
  getHistorySearch(@RequestUser() user) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { user },
      {
        cmd: PostController.prototype.getHistorySearch.name,
      },
    );
  }

  @Delete('search/:id')
  deleteSearchHistory(@Param('id') id: string) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { id },
      { cmd: PostController.prototype.deleteSearchHistory.name },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('search')
  searchPost(
    @RequestUser() user,
    @LanguageCode() languageCode: string,
    @Query() query: QueryPostDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { query, user, languageCode },
      {
        cmd: PostController.prototype.searchPost.name,
      },
    );
  }

  @Get('me')
  getMyPost(
    @RequestUser() reqUser: IRequestUser,
    @Query() query: QueryMyPostDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { reqUser, query },
      {
        cmd: PostController.prototype.getMyPost.name,
      },
    );
  }

  @Get('/detail')
  getPostById(
    @RequestUser() reqUser: IRequestUser,
    @Query() { id }: QueryPostDetail,
  ) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { reqUser, id },
      {
        cmd: PostController.prototype.getPostById.name,
      },
    );
  }

  @Get('/comment')
  getCommentByPostId(@Query() query: QueryPostCommentDto) {
    return this.messageBuilder.sendMessage(EService.POST, query, {
      cmd: PostController.prototype.getCommentByPostId.name,
    });
  }

  @Get('/comment/:commentId')
  getCommentById(@Param('commentId') commentId: string) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { commentId },
      {
        cmd: PostController.prototype.getCommentById.name,
      },
    );
  }

  @Post('/react')
  toggleReact(
    @RequestUser() reqUser: IRequestUser,
    @Body() data: ReactPostDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { reqUser, data },
      {
        cmd: PostController.prototype.toggleReact.name,
      },
    );
  }

  @Get('/react/me')
  getPostReacted(
    @RequestUser() reqUser: IRequestUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { reqUser, query },
      {
        cmd: PostController.prototype.getPostReacted.name,
      },
    );
  }

  @Put('/:id')
  updateUserPost(
    @RequestUser() user,
    @Body() body: UpdatePostDto,
    @Param('id') id: string,
  ) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { user, body, id },
      {
        cmd: PostController.prototype.updateUserPost.name,
      },
    );
  }

  @Delete('/:id')
  deletePost(@Param('id') id: string) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { id },
      {
        cmd: PostController.prototype.deletePost.name,
      },
    );
  }
}
