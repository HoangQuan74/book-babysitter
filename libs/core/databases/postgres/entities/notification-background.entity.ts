import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base-entity';
import {
  IBasicLocalization,
  IExtendedLocalizationEN,
} from '@lib/common/interfaces';

export enum ENotificationBackgroundType {
  CHAT_MESSAGE = 'chat_message',
  REQUEST_BOOKING_CONFIRMATION = 'booking_request_confirm',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELED_BY_BABYSITTER = 'booking_cancel_by_babysitter',
  BOOKING_CANCELED_BY_PARENT = 'booking_canceled_by_parent',
  BOOKING_REMINDER_23H = 'booking_reminder_to_confirm_before_23h',
  BOOKING_REMINDER_3H = 'booking_reminder_to_confirm_before_3h',
  BOOKING_REJECTED = 'booking_rejected',
  BOOKING_EXPIRED_48H_SEND_TO_PARENT = 'booking_expired_48h_send_to_parent',
  BOOKING_EXPIRED_48H_SEND_TO_BABYSITTER = 'booking_expired_48h_send_to_babysitter',
  CANCEL_REQUEST_BOOKING_CONFIRMATION = 'cancel_request_booking_confirm',
  SERVICE_DATE_NOTIFICATION = 'notification_date_use_service',
  BABYSITTING_TIME_NOTIFICATION = 'notification_booking_time',
  BABYSITTING_TIME_REMINDER = 'reminder_booking_time_babysitter',
  PARENT_TIME_REMINDER = 'reminder_booking_time_parent',
  REQUEST_REVIEW = 'request_review',
  NEW_REVIEW = 'new_review',
  NEW_COMMENT = 'new_comment',
  REPLY_COMMENT = 'reply_comment',
}

@Entity('notification_background')
export class NotificationBackgroundEntity extends BaseEntity {
  @Column({ type: 'enum', enum: ENotificationBackgroundType, unique: true })
  type: ENotificationBackgroundType;

  @Column({ type: 'jsonb' })
  receiver: IBasicLocalization;

  @Column({ type: 'jsonb', name: 'sending_time' })
  sendingTime: IBasicLocalization;

  @Column({ type: 'jsonb' })
  displayPage: IBasicLocalization;

  @Column({ type: 'boolean', name: 'is_disable' })
  isDisable: boolean;

  @Column({ type: 'jsonb', nullable: true })
  title: IExtendedLocalizationEN;

  @Column({ nullable: true, type: 'jsonb' })
  content: IExtendedLocalizationEN;
}
