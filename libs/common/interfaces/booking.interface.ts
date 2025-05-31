import {
  EBookingStatus,
  EGenderForBaby,
  ENumOfChildrenCared,
  EUserRole,
} from '../enums';
import { IQuery } from './query.interface';

export interface IBooking {
  countryId: string;
  cityId: string;
  address: string;
  numOfChildrenCared: ENumOfChildrenCared;
  bookingTimes: IBookingTime[];
  bookingChildren: IBookingChildren[];
  parentId: string;
  babysitterId: string;
  status: EBookingStatus;
  message?: string;
}

export interface IBookingTime {
  startTime: Date;
  endTime: Date;
  hasBreakTime: boolean;
}

export interface IBookingChildren {
  dob: string;
  gender: EGenderForBaby;
}

export interface IQueryBooking extends IQuery {
  status?: EBookingStatus[];
}
