import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { UserEntity } from '.';

@Entity('favorite_babysitter')
export class FavoriteBabysitterEntity extends BaseEntity {
  @Column({ name: 'babysitter_id' })
  babysitterId: string;

  @Column({ name: 'parent_id' })
  parentId: string;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'babysitter_id' })
  babysitter: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: UserEntity;
}
