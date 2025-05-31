import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base-entity';

export enum BatchType {
  PUSH = 'push',
  USER = 'user',
}

@Entity('batch_log')
export class BatchLogEntity extends BaseEntity {
  @Column({ name: 'executed_at', type: 'timestamptz' })
  executedAt: Date;

  @Column({ type: 'int' })
  total: number;

  @Column({ type: 'enum', enum: BatchType, default: BatchType.PUSH })
  type: BatchType;
}
