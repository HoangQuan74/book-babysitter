import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from './base-entity';
import { RoleEntity, UserEntity } from '.';

@Entity('user_roles')
export class UserRoleEntity extends BaseEntity {
  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Index()
  @Column({ name: 'role_id' })
  roleId: string;

  @Column({ name: 'granted_at', nullable: true })
  grantedAt: Date;

  @Column({ name: 'revoked_at' })
  revokedAt: Date;

  @Column({ name: 'login_expiration_at' })
  loginExpirationAt: Date;

  @Column({ name: 'has_admin_permission' })
  hasAdminPermission: boolean;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => RoleEntity, (role) => role.id)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  private previousHasAdminPermission: boolean;

  @BeforeInsert()
  setGrantedAtBeforeInsert() {
    if (this.hasAdminPermission === true) {
      this.grantedAt = new Date();
    }
  }

  @BeforeUpdate()
  checkAndSetGrantedAtBeforeUpdate() {
    if (
      this.hasAdminPermission === true &&
      this.previousHasAdminPermission === false
    ) {
      this.grantedAt = new Date();
    }
  }

  @AfterLoad()
  loadPreviousHasAdminPermission() {
    this.previousHasAdminPermission = this.hasAdminPermission;
  }
}
