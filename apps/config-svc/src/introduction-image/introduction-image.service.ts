import { DbName, EUserRole } from '@lib/common/enums';
import { ISaveIntroductionImage } from '@lib/common/interfaces';
import { IntroductionImageEntity } from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource, In, Not } from 'typeorm';

@Injectable()
export class IntroductionImageService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }
  async getIntroductionImage(type: EUserRole) {
    const query = await this.getMany(
      this.postgresData,
      IntroductionImageEntity,
      { where: { type }, order: { order: 'ASC' } },
    );
    return query;
  }

  async saveOrUpdateImages(images: ISaveIntroductionImage[], type: EUserRole): Promise<void> {
    const repo = this.getRepository(this.postgresData, IntroductionImageEntity);

    const imageIds = images.map((image) => image.id).filter((id) => !!id);

    await repo.delete({ id: Not(In(imageIds)), type });

    const preparedImages = images.map((image) =>
      this.createInstance(this.postgresData, IntroductionImageEntity, {
        ...image,
        url: image.url.split('?')[0],
        type,
      }),
    );

    await repo.save(preparedImages);
  }
}
