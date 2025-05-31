import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity } from './base-entity';

export enum EOtpType {
  ADMIN_LOGIN = 'admin_login',
  USER_SIGNUP = 'user_signup',
  USER_RESET_PASSWORD = 'user_reset_password',
}
@Entity('user_otp')
export class UserOtpEntity extends BaseEntity {
  @Index()
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Index()
  @Column({ name: 'otp' })
  otp: string;

  @Index()
  @Column({ name: 'email' })
  email: string;

  @Index()
  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Index()
  @Column({ type: 'enum', enum: EOtpType })
  type: EOtpType;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
