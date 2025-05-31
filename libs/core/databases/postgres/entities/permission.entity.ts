import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { ResourceEntity } from '.';

interface IPermissionName {
  langCode: string;
  name: string;
}

@Entity('permissions')
export class PermissionEntity extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column({ nullable: true, type: 'jsonb' })
  name: {
    locale: IPermissionName[];
  };

  @Column({ nullable: true })
  order: number;

  @Index()
  @Column({ name: 'resource_id' })
  resourceId: string;

  @ManyToOne(() => ResourceEntity, (resource) => resource.id)
  @JoinColumn({ name: 'resource_id' })
  resource: ResourceEntity;

  active: boolean;
}
