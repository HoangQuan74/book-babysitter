import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base-entity';

export enum ENotificationChannel {
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms',
}

export enum ENotificationStatus {
  WAITING = 'waiting',
  SENDING = 'sending',
  CANCELED = 'canceled',
  SUCCESS = 'success',
}

enum ETargetReceiver {
  ALL = 'all',
  SPECIAL = 'special',
  BABY_SITTER = 'babysitter',
  PARENT = 'parent',
}

@Entity('notification')
export class NotificationEntity extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'enum', enum: ENotificationChannel })
  channel: ENotificationChannel;

  @Column({
    type: 'enum',
    enum: ENotificationStatus,
    default: ENotificationStatus.WAITING,
  })
  status: ENotificationStatus;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'target_receiver', type: 'enum', enum: ETargetReceiver })
  targetReceiver: ETargetReceiver;

  @Column({ type: 'timestamptz', nullable: true })
  sendTime: Date;

  @Column({ type: 'jsonb', nullable: true })
  file: Object;
}
