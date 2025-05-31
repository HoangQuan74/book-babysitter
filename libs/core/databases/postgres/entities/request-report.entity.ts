import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { RequestEntity, UserEntity } from '.';
import { BaseEntity } from './base-entity';

@Entity('request_report')
export class RequestReportEntity extends BaseEntity {
  @Column({ name: 'request_id' })
  requestId: string;

  @Column({ name: 'accused_id' })
  accusedId: string;

  @Column({ name: 'reason', type: 'text' })
  reason: string;

  @Column({ name: 'answer', type: 'text', nullable: true })
  answer: string;

  @Column({ name: 'answer_id', nullable: true })
  answerId: string;

  @Column({ name: 'answered_at', nullable: true })
  answeredAt: Date;

  @OneToOne(() => RequestEntity, (request) => request.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: RequestEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accused_id' })
  accused: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'answer_id' })
  answerer: UserEntity;
}
