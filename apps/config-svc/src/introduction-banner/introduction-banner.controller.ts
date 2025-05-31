import { BadRequestException, Controller } from '@nestjs/common';
import { IntroductionBannerService } from './introduction-banner.service';
import { EUserRole } from '@lib/common/enums';
import { MessagePattern } from '@nestjs/microservices';
import { ICreateIntroductionImage, IRequestUser } from '@lib/common/interfaces';
import { errorMessage, MAX_INTRODUCTION_BANNER } from '@lib/common/constants';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { AwsClientService } from '@lib/utils/aws-client/aws-client.service';
import { formatKey } from '@lib/utils';

@Controller('introduction-banner')
export class IntroductionBannerController {
  constructor(
    private readonly introductionBannerService: IntroductionBannerService,
    private readonly awsClientService: AwsClientService,
  ) {}

  @MessagePattern({
    cmd: IntroductionBannerController.prototype.getIntroductionBanner.name,
  })
  getIntroductionBanner(payload: {
    type: EUserRole.BABY_SITTER | EUserRole.PARENT;
  }) {
    const { type } = payload;
    return this.introductionBannerService.getIntroductionBanner(type);
  }

  @MessagePattern({
    cmd: IntroductionBannerController.prototype.saveIntroductionBanner.name,
  })
  async saveIntroductionBanner(payload: {
    images: ICreateIntroductionImage[];
    reqUser: IRequestUser;
  }) {
    const { images, reqUser } = payload;
    try {
      if (images?.length > MAX_INTRODUCTION_BANNER) {
        throw new BadRequestException(errorMessage.MAX_INTRODUCTION_BANNER);
      }

      const introductionBanner = await Promise.all(
        images.map(async (image, index) => {
          const url = image.id
            ? image.url
            : await this.awsClientService.createS3PresignedUrl(
                formatKey(reqUser, image.key),
              );
          return { ...image, url, order: index };
        }),
      );

      await this.introductionBannerService.saveOrUpdateImages(
        introductionBanner,
      );
      return introductionBanner;
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }
}
