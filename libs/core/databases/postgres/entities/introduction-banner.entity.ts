import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base-entity';
import { EUserRole } from './user.entity';

@Entity('introduction_banner')
export class IntroductionBannerEntity extends BaseEntity {
  @Column()
  url: string;

  @Column()
  order: number;

  @Column({ type: 'enum', enum: [EUserRole.BABY_SITTER, EUserRole.PARENT] })
  type: EUserRole.BABY_SITTER | EUserRole.PARENT;
}
