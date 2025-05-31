import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base-entity';

@Entity('post_search')
@Index(['userId', 'search'], { unique: true })
export class PostSearchEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'search', type: 'text' })
  search: string;
}
