import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base-entity';

export enum EPostType {
  NOTIFY = 'notify',
  BANNER = 'banner',
  OPEN_SOURCE = 'open_source',
  CLIENT = 'client',
}
@Entity('post_type')
export class PostTypeEntity extends BaseEntity {
  @Column({ type: 'jsonb' })
  name: Object;

  @Column({ type: 'enum', enum: EPostType, nullable: true })
  type: EPostType;

  @Column({ type: 'bool', name: 'is_active', default: true })
  isActive: boolean;
}
