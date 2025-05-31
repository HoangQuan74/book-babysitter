import { Controller } from '@nestjs/common';
import { PostReactService } from './post-react.service';
import { MessagePattern } from '@nestjs/microservices';
import { IRequestUser } from '@lib/common/interfaces';

@Controller('post-react')
export class PostReactController {
  constructor(private readonly postReactService: PostReactService) {}

  @MessagePattern({ cmd: PostReactController.prototype.toggleReact.name })
  async toggleReact(payload: { reqUser: IRequestUser; data: any }) {
    const { reqUser, data } = payload;
    return this.postReactService.toggleReact(reqUser, data);
  }
}
