import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { LanguageEntity } from '.';

enum EFaqDisplayStatus {
  DISPLAY = 'display',
  HIDDEN = 'hidden',
}

enum EFaqType {
  BABYSITTER = 'babysitter',
  PARENT = 'parent',
}

@Entity({ name: 'faqs' })
export class FaqEntity extends BaseEntity {
  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  order: number;

  @Index()
  @Column({ name: 'language_id' })
  languageId: string;

  @Column({ name: 'faq_type', type: 'enum', enum: EFaqType })
  faqType: EFaqType;

  @Column({ name: 'display_status', type: 'enum', enum: EFaqDisplayStatus })
  displayStatus: EFaqDisplayStatus;

  @ManyToOne(() => LanguageEntity, (language) => language.id)
  @JoinColumn({ name: 'language_id' })
  language: LanguageEntity;
}
