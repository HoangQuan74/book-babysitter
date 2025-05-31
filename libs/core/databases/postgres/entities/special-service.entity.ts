import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { LanguageEntity, UserEntity } from '.';

@Entity('special_service')
export class SpecialServiceEntity extends BaseEntity {
  @Column({ type: 'jsonb' })
  content: Object;

  @Column({ type: 'jsonb', name: 'short_content', default: {} })
  shortContent: Object;
}
