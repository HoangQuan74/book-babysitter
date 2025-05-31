import { Controller } from '@nestjs/common';
import { ReviewService } from './review.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @MessagePattern({
    cmd: ReviewController.prototype.getReviews.name,
  })
  async getReviews() {
    return await this.reviewService.getReviews();
  }
}
