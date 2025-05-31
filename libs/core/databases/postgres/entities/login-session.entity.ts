import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base-entity';

@Entity('login_session')
export class LoginSessionEntity extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'refresh_token', length: 300, nullable: true })
  refreshToken: string;

  @Column({ name: 'secret_key' })
  secretKey: string;

  @Column({ name: 'device_id', nullable: true })
  deviceId: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'browser', nullable: true })
  browser: string;

  @Column({ nullable: true })
  device: string;
}
