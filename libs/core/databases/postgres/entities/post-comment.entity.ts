import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { Collection } from 'mongoose';
import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Entity('post_comment')
export class PostCommentEntity extends BaseEntity {
  @Column({ name: 'post_id' })
  postId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'comment_parent_id', nullable: true })
  commentParentId: string;

  @Column({ name: 'comment_root_id', nullable: true })
  commentRootId: string;

  @Column({ name: 'tagged_user_id', nullable: true })
  taggedUserId: string;

  @ManyToOne(() => PostEntity, (post) => post.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tagged_user_id' })
  taggedUser: UserEntity;
}
