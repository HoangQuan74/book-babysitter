import { NOTIFICATION_ALARM_TEXT } from '@lib/common/constants';
import { EGenderForBaby, ELanguage } from '@lib/common/enums';
import {
  BookingChildrenEntity,
  BookingEntity,
  BookingTimeEntity,
  NotificationAlarmEntity,
} from '@lib/core/databases/postgres/entities';
import * as moment from 'moment';

export const generateBookingCode = (num: number = 1, cityCode: number = 99) => {
  const countryCode = '704';
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const numStr = (num + 1).toString().padStart(7, '0');
  let cityCodeStr = cityCode.toString();
  if (cityCode < 10) {
    cityCodeStr = cityCodeStr.padStart(2, '0');
  }
  return `${countryCode}-${cityCodeStr}-${year}${month}-${numStr}`;
};

export const formatTimeKo = (bookingTime: BookingTimeEntity) => {
  const startTime = moment(bookingTime.startTime).utcOffset(7).format('YY년 M월 D일 HH시');
  const endTime = moment(bookingTime.endTime).utcOffset(7).format('HH시');

  const duration = moment
    .duration(moment(bookingTime.endTime).diff(moment(bookingTime.startTime)))
    .asHours();

  return `${startTime} ~ ${endTime} (${duration.toFixed(0)}시간)`;
};

export const formatTimeVi = (bookingTime: BookingTimeEntity) => {
  const startTime = moment(bookingTime.startTime).utcOffset(7).format('DD-MM-YYYY HH:mm');
  const endTime = moment(bookingTime.endTime).utcOffset(7).format('HH:mm');

  const duration = moment
    .duration(moment(bookingTime.endTime).diff(moment(bookingTime.startTime)))
    .asHours();

  return `${startTime} ~ ${endTime} (${duration.toFixed(0)} tiếng)`;
};

export const formatChildrenKo = (child: BookingChildrenEntity) => {
  const monthsOld = moment().diff(moment(child.dob), 'months');
  const genderText =
    child.gender === EGenderForBaby.SON ? '남아 1명' : '여아 1명';
  const formattedDob = moment(child.dob).format('YY년 MM월생');
  return `${formattedDob}(만 ${monthsOld}개월) ${genderText}`;
};

export const formatChildrenVi = (child: BookingChildrenEntity) => {
  const monthsOld = moment().diff(moment(child.dob), 'months');
  const genderText =
    child.gender === EGenderForBaby.SON ? '1 bé trai' : '1 bé gái';
  const dobMoment = moment(child.dob);
  const formattedDob = `tháng ${dobMoment.format('M')} năm ${dobMoment.format('YY')}`;
  return `${genderText} sinh ${formattedDob} (${monthsOld} tháng tuổi)`;
};

export const formatBookingKo = (booking: BookingEntity, lang: ELanguage) => {
  return `  ${booking.bookingTimes.map((time, index) => `${formatTimeKo(time)} ${index === booking.bookingTimes.length - 1 ? '' : '\n'}`)}
  도시: ${booking.city?.name?.[lang]}
  호텔: ${booking.address}
  아이 정보: 
    ${booking.bookingChildren.map((child, index) => `${formatChildrenKo(child)} ${index === booking.bookingChildren.length - 1 ? '' : '\n'}`)}
  시터 비용: ${booking?.currency?.unit} ${booking.prices}
  예약 코드: ${booking.bookCode}`;
};

export const formatBookingVi = (booking: BookingEntity, lang: ELanguage) => {
  return `  ${booking.bookingTimes.map((time, index) => `${formatTimeVi(time)} ${index === booking.bookingTimes.length - 1 ? '' : '\n'}`)}
  Thành phố: ${booking.city?.name?.[lang]}
  Địa điểm: ${booking.address}
  Thông tin trẻ:
    ${booking.bookingChildren.map((child, index) => `${formatChildrenVi(child)} ${index === booking.bookingChildren.length - 1 ? '' : '\n'}`)}
  Phí chăm trẻ: ${booking.prices} ${booking.currency?.unit}
  Mã đặt lịch: ${booking.bookCode}`;
};

export const formatBookingRejectKo = (booking: BookingEntity) => {
  return `  예약 코드: ${booking.bookCode}
  시터 메시지: 
    ${booking.reasonCancel}`;
};

export const formatBookingRejectVi = (booking: BookingEntity) => {
  return `  Mã đặt lịch: ${booking.bookCode}
  Tin nhắn của người chăm trẻ: 
    ${booking.reasonCancel}`;
};

export const createMessageBooking = (
  booking: BookingEntity,
  notifyAlarm: NotificationAlarmEntity,
  lang: ELanguage = ELanguage.ko,
) => {
  const message = `
  ${notifyAlarm.content}

  ${NOTIFICATION_ALARM_TEXT[lang][notifyAlarm.type]}
  ${lang === ELanguage.ko ? formatBookingKo(booking, lang) : formatBookingVi(booking, lang)}`;
  return message;
};

export const createMessageForRejectBooking = (
  booking: BookingEntity,
  notifyAlarm: NotificationAlarmEntity,
  lang: ELanguage = ELanguage.ko,
) => {
  const message = `
  ${notifyAlarm.content}
  ${lang === ELanguage.ko ? formatBookingRejectKo(booking) : formatBookingRejectVi(booking)}`;
  return message;
};

export const createMessageForRequestReviewBooking = (
  booking: BookingEntity,
  notifyAlarm: NotificationAlarmEntity,
) => {
  const message = `
  ${notifyAlarm.content}

  [예약 내용]
  ${booking.bookingTimes.map((time) => `${time.startTime} ~ ${time.endTime}\n`)}
  도시: ${booking.city?.name}
  호텔: ${booking.address}
  아이 정보: ${booking.bookingChildren.map((child) => `${child.dob} ${child.gender}\n`)}
  시터 비용: ${booking.currency.unit} ${booking.prices}
  예약 코드: ${booking.bookCode}
  `;
  return message;
};
