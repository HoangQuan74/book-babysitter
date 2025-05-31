import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { RatingUserEntity, ReviewEntity, UserEntity } from '.';

@Entity('review_babysitters')
export class ReviewBabysitterEntity extends BaseEntity {
  @Index()
  @Column({ name: 'review_id' })
  reviewId: string;

  @Index()
  @Column({ name: 'babysitter_id' })
  babysitterId: string;

  @Index()
  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @Column({ name: 'rating_id', nullable: true })
  ratingId: string;

  @ManyToOne(() => ReviewEntity, (review) => review.id)
  @JoinColumn({ name: 'review_id' })
  review: ReviewEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'babysitter_id' })
  babysitter: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: UserEntity;

  @ManyToOne(() => RatingUserEntity, (ratingUser) => ratingUser.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rating_id' })
  rating: RatingUserEntity;
}
