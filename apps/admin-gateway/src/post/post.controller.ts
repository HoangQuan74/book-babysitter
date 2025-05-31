import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { query } from 'express';
import { LanguageCode, Public, RequestUser } from '@lib/common/decorator';
import { MessageBuilder } from '@lib/core/message-builder';
import { EService, ETargetUserType } from '@lib/common/enums';
import {
  CreatePostDto,
  FilterPostDto,
  QueryPostDto,
  QueryPostTypeDto,
  UpdatePostDto,
} from './dto';
import { validateHeaderValue } from 'http';
import { TargetUserType } from '@lib/common/constants';
import { ReturningStatementNotSupportedError } from 'typeorm';

@ApiTags('Post')
@Controller('post')
@ApiBearerAuth()
export class PostController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @Public()
  @Post('list')
  getListPost(@Query() query: QueryPostDto, @Body() body: FilterPostDto) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      {
        query,
        body,
      },
      {
        cmd: PostController.prototype.getListPost.name,
      },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('type')
  getPostType(
    @LanguageCode() languageCode: string,
    @Query() { isActive }: QueryPostTypeDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { languageCode, isActive },
      {
        cmd: PostController.prototype.getPostType.name,
      },
    );
  }

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

  @ApiSecurity('X-LANG-CODE')
  @Get('target-user')
  getPostTargetUser(@LanguageCode() languageCode: string) {
    const keys = Object.keys(TargetUserType[languageCode]);
    return keys.map((key) => {
      return { value: key, text: TargetUserType[languageCode][key] };
    });
  }

  @Post('create')
  createPost(@RequestUser() user, @Body() body: CreatePostDto) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { body: Object.assign(body, { isAdminPost: true }), user },
      {
        cmd: PostController.prototype.createPost.name,
      },
    );
  }
  @ApiSecurity('X-LANG-CODE')
  @Get('/:id')
  getPostDetail(@Param('id') id: string, @LanguageCode() languageCode: string) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { id, languageCode },
      {
        cmd: PostController.prototype.getPostDetail.name,
      },
    );
  }

  @Put('/:id')
  updatePost(
    @RequestUser() user,
    @Param('id') id: string,
    @Body() body: UpdatePostDto,
  ) {
    return this.messageBuilder.sendMessage(
      EService.POST,
      { id, body, user },
      {
        cmd: PostController.prototype.updatePost.name,
      },
    );
  }
}
