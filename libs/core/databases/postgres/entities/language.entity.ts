import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base-entity';

@Entity('languages')
export class LanguageEntity extends BaseEntity {
  @Column({ name: 'language_code' })
  languageCode: string;

  @Column({ name: 'country_code' })
  countryCode: string;

  @Column({ name: 'language_name',type: 'jsonb', default: {} })
  languageName: Object;

  levels: any;
  name: string;
}
