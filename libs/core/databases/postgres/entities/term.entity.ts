import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base-entity';
// import { ETermDisplayStatus } from 'libs/common/enums';
import { TermTypeEntity } from './term-type.entity';
import { LanguageEntity } from './language.entity';

enum ETermDisplayStatus {
  DISPLAY = 'display',
  HIDDEN = 'hidden',
  CANNOT_DISPLAY = 'cannot_display',
}

@Entity('term')
export class TermEntity extends BaseEntity {
  @Column()
  order: number;

  @Column({ type: 'float', default: 0.1 })
  version: number;

  @Column({ length: 1000 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'bool' })
  isRequired: boolean;

  @Index()
  @Column({ name: 'language_id' })
  languageId: string;

  @Index()
  @Column({ name: 'term_type_id' })
  termTypeId: string;

  @Column({ name: 'display_status', type: 'enum', enum: ETermDisplayStatus })
  displayStatus: ETermDisplayStatus;

  @ManyToOne(() => TermTypeEntity, (termType) => termType.id)
  @JoinColumn({ name: 'term_type_id' })
  termType: TermTypeEntity;

  @ManyToOne(() => LanguageEntity, (language) => language.id)
  @JoinColumn({ name: 'language_id' })
  language: LanguageEntity;
}
