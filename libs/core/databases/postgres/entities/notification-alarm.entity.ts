import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base-entity';

export enum ETargetAlarm {
  BABYSITTER = 'babysitter',
  PARENT = 'parent',
}

export enum ENotificationAlarmType {
  CANCEL_BOOKING = 'cancel_booking',
  CONFIRMED_BOOKING = 'confirmed_booking',
  REQUEST_CONFIRM = 'request_confirm',
  REJECT_BOOKING = 'reject_booking',
  REQUEST_REVIEW_SERVICE = 'request_review_service',
}

@Entity('notification_alarm')
export class NotificationAlarmEntity extends BaseEntity {
  @Column({ type: 'enum', enum: ENotificationAlarmType, default: ENotificationAlarmType.CONFIRMED_BOOKING })
  type: ENotificationAlarmType;

  @Column({ type: 'jsonb', default: {} })
  title: Object;

  @Column()
  content: string;

  @Column({ nullable: true })
  action: string;

  @Column({ type: 'enum', enum: ETargetAlarm })
  target: ETargetAlarm;
}
