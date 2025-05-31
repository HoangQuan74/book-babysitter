import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { PointEntity } from './point.entity';

enum ETypePoint {
  LOGIN = 'login',
  COMMENT = 'comment',
  POST = 'post',
  RATING = 'rating',
}
@Entity('point_logs')
export class PointLogEntity extends BaseEntity {
  @Column({ type: 'float', name: 'point_added' })
  pointAdded: number;

  @Column({ type: 'float', name: 'point_after' })
  pointAfter: number;

  @Index()
  @Column({ name: 'point_id' })
  pointId: string;

  @Column({ type: 'enum', enum: ETypePoint })
  type: ETypePoint;

  @ManyToOne(() => PointEntity, (point) => point.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'point_id' })
  point: PointEntity;
}
