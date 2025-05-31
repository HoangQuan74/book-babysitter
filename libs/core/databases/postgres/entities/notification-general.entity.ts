import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base-entity';
import { GeneralNotificationViewEntity } from './notification-general-view.entity';

enum ETargetUserType {
  All = 'ALL',
  BABY_SITTER = 'babysitter',
  PARENT = 'parent',
}

@Entity('notification_general')
export class GeneralNotificationEntity extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'target_user_type', nullable: true })
  targetUserType: ETargetUserType;

  @Column({ name: 'language_code', nullable: true })
  languageCode: string;

  @Column({ name: 'is_visible', type: 'bool', default: false })
  isVisible: boolean;

  @Column({ type: 'jsonb', nullable: true })
  files: Object[];
}
