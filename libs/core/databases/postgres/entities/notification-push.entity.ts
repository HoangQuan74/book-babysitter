import { Column, Entity, JoinColumn, ManyToMany } from 'typeorm';
import { BaseEntity } from './base-entity';
import { NotificationPushTypeEntity } from './notification-push-type.entity';

@Entity('notification_push')
export class PushNotificationEntity extends BaseEntity {
  @Column({ name: 'notification_id' })
  notificationId: string;

  @Column({ name: 'is_android_applied', type: 'bool' })
  isAndroidApplied: boolean;

  @Column({ name: 'is_ios_applied', type: 'bool' })
  isIosApplied: boolean;

  @Column({ name: 'push_type_id', type: 'uuid' })
  pushTypeId: string;

  @Column({ nullable: true })
  action: string;

  @ManyToMany(() => NotificationPushTypeEntity, (type) => type.id)
  @JoinColumn({ name: 'push_type_id' })
  pushType: NotificationPushTypeEntity;
}
