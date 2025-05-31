import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BookingEntity, RequestEntity } from ".";

@Entity('request_absence')
export class RequestAbsenceEntity extends BaseEntity {
  @Column({ name: 'request_id' })
  requestId: string;

  @Column({ name: 'booking_id' })
  bookingId: string;

  @ManyToOne(() => RequestEntity, (request) => request.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: RequestEntity;

  @ManyToOne(() => BookingEntity, (booking) => booking.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: BookingEntity;
}