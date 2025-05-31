import { BadRequestException, Controller } from '@nestjs/common';
import { IntroductionImageService } from './introduction-image.service';
import { MessagePattern } from '@nestjs/microservices';
import { AwsClientService } from '@lib/utils/aws-client/aws-client.service';
import {
  ICreateIntroductionImage,
  IRequestUser,
  ISaveIntroductionImage,
} from '@lib/common/interfaces';
import { formatKey } from '@lib/utils/format.util';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { errorMessage, MAX_INTRODUCTION_IMAGE } from '@lib/common/constants';
import { EUserRole } from '@lib/common/enums';

@Controller('introduction-image')
export class IntroductionImageController {
  constructor(
    private readonly introductionImageService: IntroductionImageService,
    private readonly awsClientService: AwsClientService,
  ) {}

  @MessagePattern({
    cmd: IntroductionImageController.prototype.getIntroductionImage.name,
  })
  async getIntroductionImage(payload: { type: EUserRole }) {
    const { type } = payload;
    const result =
      await this.introductionImageService.getIntroductionImage(type);
    return result;
  }

  @MessagePattern({
    cmd: IntroductionImageController.prototype.saveIntroductionImage.name,
  })
  async saveIntroductionImage({
    images,
    type,
    reqUser,
  }: {
    images: ICreateIntroductionImage[];
    type: EUserRole;
    reqUser: IRequestUser;
  }): Promise<ISaveIntroductionImage[]> {
    try {
      if (images?.length > MAX_INTRODUCTION_IMAGE) {
        throw new BadRequestException(errorMessage.MAX_INTRODUCTION_IMAGE);
      }
      const introductionImages = await Promise.all(
        images.map(async (image, index) => {
          const url = image.id
            ? image.url
            : await this.awsClientService.createS3PresignedUrl(
                formatKey(reqUser, image.key),
              );
          return { ...image, url, order: index };
        }),
      );

      await this.introductionImageService.saveOrUpdateImages(
        introductionImages,
        type,
      );
      return introductionImages;
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }
}
