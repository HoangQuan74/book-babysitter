import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { RequestEntity, UserEntity } from '.';
import { BaseEntity } from './base-entity';

@Entity('request_question')
export class RequestQuestionEntity extends BaseEntity {
  @Column({ name: 'request_id' })
  requestId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @ManyToOne(() => RequestEntity, (request) => request.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: RequestEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
