import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base-entity';
import { UserEntity } from './user.entity';
import { BookingEntity } from './booking.entity';

@Entity('currencies')
export class CurrencyEntity extends BaseEntity {
  @Column()
  unit: string;

  @Column({ name: 'minSalary', nullable: true })
  minSalary: number;

  @Column({ name: 'maxSalary', nullable: true })
  maxSalary: number;

  @Column({ name: 'step', nullable: true })
  step: number;

  @OneToMany(() => UserEntity, (user) => user.currency)
  users: UserEntity[];

  @OneToMany(() => BookingEntity, (booking) => booking.currency)
  bookings: BookingEntity[];

  rangeSalaries: number[];
}
