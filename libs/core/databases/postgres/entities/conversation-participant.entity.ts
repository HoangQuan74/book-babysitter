import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { ConversationEntity } from './conversation.entity';
import { UserEntity } from './user.entity';

@Entity('conversation_participant')
export class ConversationParticipantEntity extends BaseEntity {
  @Column({ name: 'conversation_id' })
  conversationId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'is_muted', type: 'bool', default: false })
  isMuted: boolean;

  @Column({ name: 'is_pinned', type: 'bool', default: false })
  isPinned: boolean;

  @Column({ name: 'is_marked', type: 'bool', default: false })
  isMarked: boolean;

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: ConversationEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
