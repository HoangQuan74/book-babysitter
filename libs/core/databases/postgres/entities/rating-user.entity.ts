import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './base-entity';
import {
  BookingEntity,
  RatingCommentEntity,
  ReviewBabysitterEntity,
  UserEntity,
} from '.';

@Entity('rating_users')
export class RatingUserEntity extends BaseEntity {
  @Column()
  point: number;

  @Column({ default: false })
  isSeen: boolean;

  @Index()
  @Column({ name: 'babysitter_id' })
  babysitterId: string;

  @Index()
  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @Index()
  @Column({ name: 'booking_id', nullable: true })
  bookingId: string;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'babysitter_id' })
  babysitter: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: UserEntity;

  @OneToOne(
    () => RatingCommentEntity,
    (ratingComment) => ratingComment.rating,
    { createForeignKeyConstraints: false, cascade: true },
  )
  comment: RatingCommentEntity;

  @OneToOne(() => BookingEntity, (booking) => booking.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: BookingEntity;

  @OneToMany(
    () => ReviewBabysitterEntity,
    (reviewBabysitter) => reviewBabysitter.rating,
    { cascade: true },
  )
  reviewBabysitters: ReviewBabysitterEntity[];
}
