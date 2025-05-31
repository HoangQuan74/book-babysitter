import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base-entity';

@Entity('post_category')
export class PostCategoryEntity extends BaseEntity {
  @Column({ type: 'jsonb' })
  name: Object;

  @Column({ type: 'bool', name: 'is_active', default: true })
  isActive: boolean;
}
