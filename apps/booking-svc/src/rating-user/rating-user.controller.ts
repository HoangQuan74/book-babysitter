import { Controller } from '@nestjs/common';
import { RatingUserService } from './rating-user.service';
import { MessagePattern } from '@nestjs/microservices';
import { IQuery, IRatingUser, IRequestUser } from '@lib/common/interfaces';

@Controller('rating-user')
export class RatingUserController {
  constructor(private readonly ratingUserService: RatingUserService) {}

  @MessagePattern({
    cmd: RatingUserController.prototype.getRatingUserById.name,
  })
  async getRatingUserById(ratingId: string) {
    return await this.ratingUserService.getRatingUserById(ratingId);
  }

  @MessagePattern({
    cmd: RatingUserController.prototype.createRatingBabysitter.name,
  })
  async createRatingBabysitter(payload: {
    reqUser: IRequestUser;
    data: IRatingUser;
  }) {
    const { reqUser, data } = payload;
    return await this.ratingUserService.createRatingBabysitter(reqUser, data);
  }

  @MessagePattern({
    cmd: RatingUserController.prototype.deleteRatingBabysitter.name,
  })
  async deleteRatingBabysitter(payload: { reqUser: IRequestUser; id: string }) {
    const { reqUser, id } = payload;
    return await this.ratingUserService.deleteRatingBabysitter(reqUser, id);
  }

  @MessagePattern({
    cmd: RatingUserController.prototype.getRatingBabysitterDetail.name,
  })
  async getRatingBabysitterDetail(payload: {
    reqUser: IRequestUser;
    id: string;
  }) {
    const { reqUser, id } = payload;
    return await this.ratingUserService.getRatingBabysitterById(reqUser, id);
  }

  @MessagePattern({
    cmd: RatingUserController.prototype.getRatingNotification.name,
  })
  async getRatingNotification(payload: {
    reqUser: IRequestUser;
    query: IQuery;
  }) {
    const { reqUser, query } = payload;
    return await this.ratingUserService.getRatingNotification(reqUser, query);
  }

  @MessagePattern({
    cmd: RatingUserController.prototype.seenRatingNotification.name,
  })
  async seenRatingNotification(payload: { reqUser: IRequestUser; id: string }) {
    const { reqUser, id } = payload;
    return await this.ratingUserService.seenRatingNotification(reqUser, id);
  }
}
