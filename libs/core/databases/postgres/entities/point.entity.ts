import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './base-entity';
import { PointLogEntity, UserEntity } from '.';

@Entity('points')
export class PointEntity extends BaseEntity {
  @Column({ name: 'total_point', default: 0, type: 'float' })
  totalPoint: number;

  @Index()
  @Column({ name: 'baby_sitter_id' })
  babySitterId: string;

  @OneToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'baby_sitter_id' })
  babySitter: UserEntity;

  @OneToMany(() => PointLogEntity, (pointLog) => pointLog.point, { onDelete: 'CASCADE' })
  logs: PointLogEntity[];
}
