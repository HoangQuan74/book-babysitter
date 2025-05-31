import { ENotificationAlarmType } from '@lib/core/databases/postgres/entities';
import { ETypePoint } from '../enums';

export const SOCKET_KEY = process.env.SOCKET_KEY || 'socket_key';
export const MINIMUM_REVIEW_COUNT = 3;

export const ONE_HOUR = 3600;
export const MINIMUM_WORKING_TIME =
  ONE_HOUR * (parseInt(process.env.MINIMUM_WORKING_TIME) || 6);

export const POINT_ADDED = {
  [ETypePoint.RATING]: (rating: number): number => rating,
  [ETypePoint.COMMENT]: 0.2,
  [ETypePoint.POST]: 0.5,
  [ETypePoint.LOGIN]: 0.1,
};
export const MAX_COMMENTS_FOR_POINTS = 5;
export const MAX_POST_FOR_POINTS = 5;
export const MAX_INTRODUCTION_IMAGE = 10;
export const MAX_INTRODUCTION_BANNER = 10;

export const MAX_ADMIN_USER_PROFILE_POST = 5;
export const MAX_ADMIN_USER_PROFILE_BOOKING = 5;

export const MIN_REVIEWS_FOR_BABYSITTER_RANKING = 5;
export const LIMIT_BABYSITTER_RANKING = 20;

export const LIMIT_STATISTICS_BABYSITTER_LIST = 10;

export const OPEN_SOURCE_LICENSE = {
  ko: '오픈소스 라이선스 관련 약관 고시.',
  vi: 'Thông báo điều khoản liên quan đến Open source  license.',
};

export const NOTIFICATION_ALARM_TEXT = {
  ko: {
    [ENotificationAlarmType.CANCEL_BOOKING]: '[확정 예약 취소 내역]',
    [ENotificationAlarmType.CONFIRMED_BOOKING]: '[ 확정 예약 내용]',
    [ENotificationAlarmType.REJECT_BOOKING]: '',
    [ENotificationAlarmType.REQUEST_CONFIRM]: '[예약 내용]',
    [ENotificationAlarmType.REQUEST_REVIEW_SERVICE]: '',
  },
  vi: {
    [ENotificationAlarmType.CANCEL_BOOKING]: '[ Chi tiết hủy ]',
    [ENotificationAlarmType.CONFIRMED_BOOKING]: '[ Nội dung xác nhận]',
    [ENotificationAlarmType.REJECT_BOOKING]: '',
    [ENotificationAlarmType.REQUEST_CONFIRM]: '[Nội dung đặt lịch]',
    [ENotificationAlarmType.REQUEST_REVIEW_SERVICE]: '',
  },
};

export const MAX_PIN_BOOKING_CONVERSATION = 5;
