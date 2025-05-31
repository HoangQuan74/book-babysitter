import { Controller } from '@nestjs/common';
import { BookingService } from './booking.service';
import { MessagePattern } from '@nestjs/microservices';
import {
  IBooking,
  IQuery,
  IQueryBooking,
  IRequestUser,
} from '@lib/common/interfaces';
import { ELanguage } from '@lib/common/enums';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @MessagePattern({
    cmd: BookingController.prototype.getBookings.name,
  })
  getBookings(query: IQuery) {
    return this.bookingService.getBookings(query);
  }

  @MessagePattern({
    cmd: BookingController.prototype.getUserBookings.name,
  })
  getUserBookings(payload: {
    reqUser: IRequestUser;
    query: IQueryBooking;
    lang: ELanguage;
  }) {
    const { reqUser, query, lang } = payload;
    return this.bookingService.getUserBookings(reqUser, query, lang);
  }

  @MessagePattern({
    cmd: BookingController.prototype.getBookingSchedules.name,
  })
  getBookingSchedules(payload: {
    reqUser: IRequestUser;
    query: any;
    lang: ELanguage;
  }) {
    const { reqUser, query, lang } = payload;
    return this.bookingService.getBookingSchedules(reqUser, query, lang);
  }

  @MessagePattern({
    cmd: BookingController.prototype.getBookingById.name,
  })
  getBookingById(payload: {
    id: string;
    lang: ELanguage;
    reqUser: IRequestUser;
    bookCode: string;
  }) {
    const { id, lang, reqUser, bookCode } = payload;
    return this.bookingService.getBookingDetail(lang, reqUser, id, bookCode);
  }

  @MessagePattern({
    cmd: BookingController.prototype.getBookingDraftWithBabysitter.name,
  })
  getBookingDraftWithBabysitter(payload: {
    babysitterId: string;
    lang: ELanguage;
    reqUser: IRequestUser;
  }) {
    const { babysitterId, lang, reqUser } = payload;
    return this.bookingService.getBookingDetail(
      lang,
      reqUser,
      null,
      null,
      babysitterId,
    );
  }

  @MessagePattern({
    cmd: BookingController.prototype.createBooking.name,
  })
  createBooking(payload: { reqUser: IRequestUser; data: IBooking }) {
    const { reqUser, data } = payload;
    return this.bookingService.createBooking(reqUser, data);
  }

  @MessagePattern({
    cmd: BookingController.prototype.createBookingParent.name,
  })
  async createBookingParent(payload: {
    reqUser: IRequestUser;
    data: IBooking;
  }) {
    const { reqUser, data } = payload;
    const booking = await this.bookingService.createBooking(reqUser, {
      ...data,
      parentId: reqUser.userId,
    });
    return booking;
  }

  @MessagePattern({
    cmd: BookingController.prototype.cancelBooking.name,
  })
  cancelBooking(data) {
    return this.bookingService.cancelBooking(data);
  }

  @MessagePattern({
    cmd: BookingController.prototype.confirmBooking.name,
  })
  confirmBooking(payload: { reqUser: IRequestUser; bookingId: string }) {
    const { reqUser, bookingId } = payload;
    return this.bookingService.confirmBooking(reqUser, bookingId);
  }

  @MessagePattern({
    cmd: BookingController.prototype.getBookingNotifications.name,
  })
  getBookingNotifications(payload: { reqUser: IRequestUser; query: any }) {
    const { reqUser, query } = payload;
    return this.bookingService.getBookingNotifications(reqUser, query);
  }

  @MessagePattern({
    cmd: BookingController.prototype.getBookingConfirmOfConversation.name,
  })
  getBookingConfirmOfConversation(payload: {
    partnerId: string;
    reqUser: IRequestUser;
    query: IQuery;
  }) {
    const { partnerId, reqUser, query } = payload;
    return this.bookingService.getBookingWithPartner(partnerId, reqUser, query);
  }
}
