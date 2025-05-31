import { Controller } from '@nestjs/common';
import { UserImageService } from './user-image.service';
import { MessagePattern } from '@nestjs/microservices';
import { IRequestUser } from '@lib/common/interfaces';

@Controller('user-image')
export class UserImageController {
  constructor(private readonly userImageService: UserImageService) {}

  @MessagePattern({
    cmd: UserImageController.prototype.deleteUserImageById.name,
  })
  deleteUserImageById({ reqUser, id }: { reqUser: IRequestUser; id: string }) {
    return this.userImageService.deleteUserImageById(reqUser, id);
  }

  @MessagePattern({
    cmd: UserImageController.prototype.setUserImageAsDefault.name,
  })
  setUserImageAsDefault({ reqUser, id }: { reqUser: IRequestUser; id: string }) {
    return this.userImageService.setUserImageAsDefault(reqUser, id);
  }
}
