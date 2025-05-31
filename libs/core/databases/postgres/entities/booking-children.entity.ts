import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { BookingEntity } from '.';

enum EGenderForBaby {
  SON = 'son',
  DAUGHTER = 'daughter',
}

@Entity('booking_children')
export class BookingChildrenEntity extends BaseEntity {
  @Column({ name: 'booking_id' })
  bookingId: string;

  @Column({ type: 'enum', enum: EGenderForBaby })
  gender: EGenderForBaby;

  @Column()
  dob: Date;

  @ManyToOne(() => BookingEntity, (booking) => booking.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: BookingEntity;

  age: any;
}
