import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { RequestEntity, UserEntity } from '.';

@Entity('request_contact')
export class RequestContactEntity extends BaseEntity {
  @Column({ name: 'request_id' })
  requestId: string;

  @Column()
  phone: string;

  @OneToOne(() => RequestEntity, (request) => request.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: RequestEntity;
}
