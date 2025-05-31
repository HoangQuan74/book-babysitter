import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { PostEntity } from './post.entity';
import { UserEntity } from '.';

@Entity('post_view')
@Index(['postId', 'viewerId'], { unique: true })
export class PostViewEntity extends BaseEntity {
  @Column({ name: 'post_id' })
  postId: string;

  @Column({ name: 'viewer_id' })
  viewerId: string;

  @ManyToOne(() => PostEntity, (post) => post.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'viewer_id' })
  viewer: UserEntity;
}
