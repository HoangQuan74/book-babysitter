import { BaseRepository } from '@lib/core/repository';
import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { BookingService } from './booking/booking.service';
import { ENotificationBackgroundType } from '@lib/core/databases/postgres/entities';
import { EUserRole } from '@lib/common/enums';
import { UserService } from './user/user.service';

@Injectable()
export class CronSvcService
  extends BaseRepository
  implements OnModuleInit, OnApplicationShutdown
{
  constructor(
    private readonly configService: ConfigService,
    private readonly scheduler: SchedulerRegistry,
    private readonly bookingService: BookingService,
    private readonly userService: UserService,
  ) {
    super();
  }

  onModuleInit() {
    const reminder3HoursLeftTime = this.configService.get<string>(
      'scheduler.reminder3HoursLeftTime',
    );
    const jobRemind3h = new CronJob(
      reminder3HoursLeftTime,
      this.reminderConfirmBookingWhen3HoursLeft.bind(this),
    );
    jobRemind3h.start();

    const reminder23HoursLeftTime = this.configService.get<string>(
      'scheduler.reminder23HoursLeftTime',
    );
    const jobRemind23h = new CronJob(
      reminder23HoursLeftTime,
      this.reminderConfirmBookingWhen23HoursLeft.bind(this),
    );
    jobRemind23h.start();

    const rejectedAfter48Hours = this.configService.get<string>(
      'scheduler.rejectedAfter48Hours',
    );
    const jobRejected = new CronJob(
      rejectedAfter48Hours,
      this.rejectedBookingAfter48Hours.bind(this),
    );
    jobRejected.start();

    const hardDeleteUser = this.configService.get<string>(
      'scheduler.hardDeleteUser',
    );
    const jobHardDeleteUser = new CronJob(
      hardDeleteUser,
      this.hardDeleteUser.bind(this),
    );
    jobHardDeleteUser.start();

    const updateStatusBookingComplete = this.configService.get<string>(
      'scheduler.updateStatusBookingComplete',
    );
    const jobUpdateStatusBookingComplete = new CronJob(
      updateStatusBookingComplete,
      this.updateStatusBookingComplete.bind(this),
    );
    jobUpdateStatusBookingComplete.start();
  }

  onApplicationShutdown() {
    const jobRemind3h = this.scheduler.getCronJob(
      CronSvcService.prototype.reminderConfirmBookingWhen3HoursLeft.name,
    );
    jobRemind3h.stop();

    const jobRemind23h = this.scheduler.getCronJob(
      CronSvcService.prototype.reminderConfirmBookingWhen23HoursLeft.name,
    );
    jobRemind23h.stop();

    const jobRejected = this.scheduler.getCronJob(
      CronSvcService.prototype.rejectedBookingAfter48Hours.name,
    );
    jobRejected.stop();

    const jobHardDeleteUser = this.scheduler.getCronJob(
      CronSvcService.prototype.hardDeleteUser.name,
    );
    jobHardDeleteUser.stop();

    const jobUpdateStatusBookingComplete = this.scheduler.getCronJob(
      CronSvcService.prototype.updateStatusBookingComplete.name,
    );
    jobUpdateStatusBookingComplete.stop();
  }

  async reminderConfirmBookingWhen23HoursLeft() {
    const bookings = await this.bookingService.getReminderBooking(16);
    await this.bookingService.sendNotification(bookings, {
      babysitter: ENotificationBackgroundType.BOOKING_REMINDER_23H,
    });
  }

  async reminderConfirmBookingWhen3HoursLeft() {
    const bookings = await this.bookingService.getReminderBooking(3);
    await this.bookingService.sendNotification(bookings, {
      babysitter: ENotificationBackgroundType.BOOKING_REMINDER_3H,
    });
  }

  async rejectedBookingAfter48Hours() {
    const bookings = await this.bookingService.getReminderBooking(0, [
      EUserRole.BABY_SITTER,
      EUserRole.PARENT,
    ]);
    await this.bookingService.sendNotification(bookings, {
      babysitter:
        ENotificationBackgroundType.BOOKING_EXPIRED_48H_SEND_TO_BABYSITTER,
      parent: ENotificationBackgroundType.BOOKING_EXPIRED_48H_SEND_TO_PARENT,
    });
    await this.bookingService.updateBookingRejectAfter48Hours(
      bookings.map((booking) => booking.id),
    );
  }

  async hardDeleteUser() {
    await this.userService.hardDeleteUser();
  }

  async updateStatusBookingComplete() {
    await this.bookingService.updateStatusBookingComplete();
  }
}
