import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base-entity';

@Entity('notification_general_view')
@Index(['generalNotificationId', 'userId'], { unique: true })
export class GeneralNotificationViewEntity extends BaseEntity {
  @Column({ name: 'general_notification_id' })
  generalNotificationId: string;

  @Column({ name: 'user_id' })
  userId: string;
}
