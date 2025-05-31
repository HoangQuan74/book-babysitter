import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base-entity';
import { EUserRole } from './user.entity';

@Entity('introduction_image')
export class IntroductionImageEntity extends BaseEntity {
  @Column()
  url: string;

  @Column()
  order: number;

  @Column({
    type: 'enum',
    enum: [EUserRole.BABY_SITTER, EUserRole.PARENT],
    default: EUserRole.BABY_SITTER,
  })
  type: EUserRole;
}
