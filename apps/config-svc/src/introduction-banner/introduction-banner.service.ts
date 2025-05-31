import { DbName, ETargetUserType, EUserRole } from '@lib/common/enums';
import { ISaveIntroductionImage } from '@lib/common/interfaces';
import {
  EPostType,
  IntroductionBannerEntity,
  PostEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource, In, Not } from 'typeorm';

@Injectable()
export class IntroductionBannerService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async getIntroductionBanner(type: EUserRole.BABY_SITTER | EUserRole.PARENT) {
    return this.getOne(this.postgresData, PostEntity, {
      where: {
        type: { type: EPostType.BANNER },
        targetUserType: In([type, ETargetUserType.ALL]),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async createIntroductionBanner(data: any) {
    return data;
  }

  async saveOrUpdateImages(images: ISaveIntroductionImage[]): Promise<void> {
    const repo = this.getRepository(
      this.postgresData,
      IntroductionBannerEntity,
    );

    const imageIds = images.map((image) => image.id).filter((id) => !!id);

    await repo.delete({ id: Not(In(imageIds)) });

    const preparedImages = images.map((image) =>
      this.createInstance(this.postgresData, IntroductionBannerEntity, {
        ...image,
        url: image.url.split('?')[0],
      }),
    );

    await repo.save(preparedImages);
  }
}
