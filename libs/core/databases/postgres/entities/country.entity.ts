import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base-entity';
import { LanguageEntity, CityEntity } from '.';

@Entity('country')
export class CountryEntity extends BaseEntity {
  @Column({ type: 'jsonb' })
  name: Object;

  @OneToMany(() => CityEntity, (city) => city.country, { cascade: true })
  cities: CityEntity[];
}
