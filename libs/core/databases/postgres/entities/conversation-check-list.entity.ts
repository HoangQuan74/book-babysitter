import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base-entity';

@Entity('conversation_check_list')
export class ConversationCheckListEntity extends BaseEntity {
  @Column({ type: 'jsonb' })
  content: Object;

  // TODO: seeding data
}
