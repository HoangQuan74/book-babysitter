import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { BookingEntity } from '.';

@Entity('booking_time')
export class BookingTimeEntity extends BaseEntity {
  @Column({ name: 'booking_id' })
  bookingId: string;

  @Column({
    name: 'start_time',
    transformer: {
      to: (value: Date) => (value ? new Date(value).toISOString() : null),
      from: (value: string) => (value ? new Date(value) : null),
    },
  })
  startTime: Date;

  @Column({
    name: 'end_time',
    transformer: {
      to: (value: Date) => (value ? new Date(value).toISOString() : null),
      from: (value: string) => (value ? new Date(value) : null),
    },
  })
  endTime: Date;

  @Column({ name: 'has_break_time', default: false })
  hasBreakTime: boolean;

  @ManyToOne(() => BookingEntity, (booking) => booking.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: BookingEntity;
}
