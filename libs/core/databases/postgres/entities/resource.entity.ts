import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base-entity';
import { PermissionEntity } from '.';

type LanguageCode = 'vi' | 'ko';

@Entity('resources')
export class ResourceEntity extends BaseEntity {
  @Column({ type: 'jsonb' })
  name: Record<LanguageCode, string>;

  @Column({ nullable: true })
  order: number;

  @OneToMany(() => PermissionEntity, (permission) => permission.resource)
  permissions: PermissionEntity[];

}
