import {
  AfterLoad,
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
  BookingChildrenEntity,
  BookingTimeEntity,
  CityEntity,
  CurrencyEntity,
  RatingUserEntity,
  UserEntity,
} from '.';
import { isEmpty } from 'lodash';

enum EBookingStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  BABY_SITTER_CANCEL = 'babysitter_cancel',
  PARENT_CANCEL = 'parent_cancel',
  COMPLETED = 'completed',
}

enum ENumOfChildrenCared {
  ONE = 'one',
  TWO = 'two',
  GREATER_OR_EQUAL_THREE = 'greater or equal three',
}

export enum PaymentMethod {
  CASH = 'cash',
}

@Entity('booking')
export class BookingEntity extends BaseEntity {
  @Column({ nullable: true, unique: true })
  bookCode: string;

  @Index()
  @Column({ name: 'babysitter_id' })
  babysitterId: string;

  @Index()
  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @Column({ nullable: true })
  prices: number;

  @Index()
  @Column({ name: 'currency_id' })
  currencyId: string;

  @Column({
    type: 'enum',
    enum: EBookingStatus,
    default: EBookingStatus.PENDING,
  })
  status: EBookingStatus;

  @Column({ nullable: true })
  address: string;

  @Column({ name: 'city_id', nullable: true })
  cityId: string;

  @Column({
    name: 'num_of_children',
    type: 'enum',
    enum: ENumOfChildrenCared,
    nullable: true,
  })
  numOfChildren: ENumOfChildrenCared;

  @Column({ name: 'confirmed_at', nullable: true })
  confirmedAt: Date;

  @Column({ name: 'canceled_at', nullable: true })
  canceledAt: Date;

  @Column({ name: 'reasonCancel', nullable: true })
  reasonCancel: string;

  @Column({ name: 'is_reject', nullable: true })
  isReject: boolean;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @Column({ name: 'is_viewed', default: false })
  isViewed: boolean;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'babysitter_id' })
  babysitter: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: UserEntity;

  @ManyToOne(() => CurrencyEntity, (currency) => currency.id)
  @JoinColumn({ name: 'currency_id' })
  currency: CurrencyEntity;

  @OneToMany(() => BookingTimeEntity, (time) => time.booking, { cascade: true })
  bookingTimes: BookingTimeEntity[];

  @OneToMany(() => BookingChildrenEntity, (children) => children.booking, {
    cascade: true,
  })
  bookingChildren: BookingChildrenEntity[];

  @ManyToOne(() => CityEntity, (city) => city.id)
  @JoinColumn({ name: 'city_id' })
  city: CityEntity;

  @OneToOne(() => RatingUserEntity, (rating) => rating.booking, {
    createForeignKeyConstraints: false,
  })
  rating: RatingUserEntity;

  remainingTime: number;
  durationTimeToConfirm: number = 48 * 3600;

  @AfterLoad()
  countDown() {
    if (this.status !== EBookingStatus.PENDING) return;

    const now = new Date();
    let effectiveDurationTimeToConfirm = this.durationTimeToConfirm;

    if (!isEmpty(this.bookingTimes)) {
      const earliestStartTime = this.bookingTimes.reduce(
        (earliest, bookingTime) =>
          bookingTime.startTime < earliest.startTime ? bookingTime : earliest,
      ).startTime;

      const timeUntilEarliestBooking =
        (earliestStartTime.getTime() - this.createdAt.getTime()) / 1000;

      if (timeUntilEarliestBooking < this.durationTimeToConfirm) {
        effectiveDurationTimeToConfirm = Math.floor(timeUntilEarliestBooking);
      }
    }

    const elapsedTime = (now.getTime() - this.createdAt.getTime()) / 1000;
    this.remainingTime = Math.max(
      effectiveDurationTimeToConfirm - Math.floor(elapsedTime),
      0,
    );
  }
}
