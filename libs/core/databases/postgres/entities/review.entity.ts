import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base-entity';

@Entity('reviews')
export class ReviewEntity extends BaseEntity {
  @Column({ type: 'jsonb', default: {} })
  content: Object;
}
