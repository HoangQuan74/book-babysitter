import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { UserEntity } from './user.entity';

@Entity('user_device')
export class UserDeviceEntity extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'device_id' })
  deviceId: string;

  @Column({ name: 'fcm_token' })
  fcmToken: string;

  @Column({ nullable: true })
  platform: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Object;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
