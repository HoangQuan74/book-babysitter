import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './base-entity';
import { RatingUserEntity } from './rating-user.entity';
import { RatingCommentImageEntity, UserEntity } from '.';

@Entity('rating_comments')
export class RatingCommentEntity extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Index()
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Index()
  @Column({ name: 'rating_id', nullable: true })
  ratingId: string;

  @Index()
  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @OneToOne(() => RatingCommentEntity, (comment) => comment.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: RatingCommentEntity;

  @OneToOne(() => RatingCommentEntity, (comment) => comment.parent, {
    createForeignKeyConstraints: false,
  })
  children: RatingCommentEntity;

  @OneToOne(() => RatingUserEntity, (ratingUser) => ratingUser.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rating_id' })
  rating: RatingUserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => RatingCommentImageEntity, (image) => image.ratingComment, {
    cascade: true,
  })
  images: RatingCommentImageEntity[];
}
