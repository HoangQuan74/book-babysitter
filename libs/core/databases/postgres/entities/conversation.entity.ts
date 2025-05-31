import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { ConversationParticipantEntity } from '.';

@Entity('conversation')
export class ConversationEntity extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ default: false, name: 'is_admin' })
  isAdmin: boolean;

  @OneToMany(
    () => ConversationParticipantEntity,
    (participant) => participant.conversation,
    { cascade: true, onDelete: 'CASCADE' },
  )
  participants: ConversationParticipantEntity[];
}
