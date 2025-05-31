import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { PermissionEntity, RoleEntity } from '.';

@Entity('role_permissions')
export class RolePermissionEntity extends BaseEntity {
  @Index()
  @Column({ name: 'role_id' })
  roleId: string;

  @Index()
  @Column({ name: 'permission_id' })
  permissionId: string;

  @ManyToOne(() => RoleEntity, (role) => role.id)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @ManyToOne(() => PermissionEntity, (permission) => permission.id)
  @JoinColumn({ name: 'permission_id' })
  permission: PermissionEntity;
}
