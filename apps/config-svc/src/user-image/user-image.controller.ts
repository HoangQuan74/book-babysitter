import { Controller } from '@nestjs/common';
import { UserImageService } from './user-image.service';

@Controller('user-image')
export class UserImageController {
  constructor(private readonly userImageService: UserImageService) {}
}
