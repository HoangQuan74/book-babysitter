import { Controller } from '@nestjs/common';
import { CommentService } from './comment.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @MessagePattern({
    cmd: CommentController.prototype.createComment.name,
  })
  createComment(data) {
    return this.commentService.createComment(data);
  }
}
