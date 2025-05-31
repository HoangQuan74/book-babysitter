import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { RatingCommentEntity } from '.';

@Entity('rating_comment_images')
export class RatingCommentImageEntity extends BaseEntity {
  @Column()
  url: string;

  @Index()
  @Column({ name: 'rating_comment_id' })
  ratingCommentId: string;

  @ManyToOne(() => RatingCommentEntity, (comment) => comment.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rating_comment_id' })
  ratingComment: RatingCommentEntity;
}
