import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base-entity';

@Entity('email_template')
export class EmailTemplate extends BaseEntity {
  @Column()
  name: string;

  @Column()
  subject: string;

  @Column()
  title: string;

  @Index()
  @Column()
  action: string;

  @Column({ type: 'bool', name: 'is_active' })
  isActive: boolean;
}
