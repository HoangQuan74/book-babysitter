import { Controller } from '@nestjs/common';
import { PostCommentService } from './post-comment.service';
import { MessagePattern } from '@nestjs/microservices';
import { IQuery, IRequestUser } from '@lib/common/interfaces';

@Controller('post-comment')
export class PostCommentController {
  constructor(private readonly postCommentService: PostCommentService) {}

  @MessagePattern({
    cmd: PostCommentController.prototype.getCommentByPostId.name,
  })
  getCommentByPostId(query: any) {
    return this.postCommentService.getCommentByPostId(query);
  }

  @MessagePattern({
    cmd: PostCommentController.prototype.getCommentById.name,
  })
  getCommentById(payload: { commentId: string }) {
    const { commentId } = payload;
    return this.postCommentService.getCommentById(commentId);
  }

  @MessagePattern({
    cmd: PostCommentController.prototype.getMyCommentsOnPosts.name,
  })
  getMyCommentsOnPosts(payload: { reqUser: IRequestUser; query: IQuery }) {
    const { reqUser, query } = payload;
    return this.postCommentService.getMyCommentsOnPosts(reqUser, query);
  }
}
