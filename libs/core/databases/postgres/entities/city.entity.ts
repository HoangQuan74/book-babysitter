import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base-entity';
import { CountryEntity } from './country.entity';
import { BookingEntity } from './booking.entity';
import { UserEntity } from './user.entity';

@Entity('cities')
export class CityEntity extends BaseEntity {
  @Column({ type: 'jsonb' })
  name: Object;

  @Column({ name: 'is_user_created', type: 'bool', default: false })
  isUserCreated: Boolean;

  @Index()
  @Column({ name: 'country_id' })
  countryId: string;

  @Column({ name: 'code' })
  @Generated('increment')
  code: number;

  @ManyToOne(() => CountryEntity, (country) => country.id)
  @JoinColumn({ name: 'country_id' })
  country: CountryEntity;

  @OneToMany(() => BookingEntity, (booking) => booking.city)
  bookings: BookingEntity[];

  @OneToMany(() => UserEntity, (babysitter) => babysitter.city)
  babysitters: UserEntity[];
}
