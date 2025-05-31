import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base-entity';

@Entity('notification_push_type')
export class NotificationPushTypeEntity extends BaseEntity {
  @Column({ type: 'jsonb' })
  name: Object;

  @Column({ name: 'is_active', type: 'bool', default: true })
  isActive: boolean;
}
