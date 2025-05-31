import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base-entity';
import { TermEntity } from './term.entity';

@Entity('term_types')
export class TermTypeEntity extends BaseEntity {
  @Column({ type: 'jsonb', default: {} })
  name: Object;

  @OneToMany(() => TermEntity, (term) => term.termType)
  terms: TermEntity[];
}
