import { Controller } from '@nestjs/common';
import { RatingCommentService } from './rating-comment.service';
import { MessagePattern } from '@nestjs/microservices';
import { ICreateRatingComment, IRequestUser } from '@lib/common/interfaces';

@Controller('rating-comment')
export class RatingCommentController {
  constructor(private readonly ratingCommentService: RatingCommentService) {}

  @MessagePattern({
    cmd: RatingCommentController.prototype.createComment.name,
  })
  createComment(payload: {
    reqUser: IRequestUser;
    data: ICreateRatingComment;
  }) {
    const { reqUser, data } = payload;
    return this.ratingCommentService.createComment(reqUser, data);
  }
}
