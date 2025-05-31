import {
  IBabysitterSpecialService,
  IQuery,
  IUpdateBabysitterSpecialService,
  IUpdateUserImage,
  IUpdateUserLanguages,
  IUserImage,
  IUserLanguage,
} from '.';
import {
  EFilterAge,
  ELanguage,
  ENumberOfChild,
  ENumberOfExperience,
  EnumGender,
  ERating,
  ESortBabysitter,
  ETypeSearchUser,
  EUserRole,
} from '../enums';

export interface IRequestUser {
  userId?: string;
  role?: EUserRole;
  username?: string;
  sessionId?: string;
  exp?: number;
}

export interface IUpdateUser {
  id: string;
  avatar?: string;
  username: string;
  dob?: string;
  phone?: string;
  cityId?: string;
  introduce?: string;
  salary?: number;
  currencyId?: string;
  settingLanguageId?: string;
  allowBooking?: boolean;

  gender?: EnumGender;
  numExperience?: ENumberOfExperience;
  numChild?: ENumberOfChild;

  userLanguages?: IUpdateUserLanguages[];
  userImages?: IUpdateUserImage[];
  babysitterSpecialServices?: IUpdateBabysitterSpecialService[];

  active: boolean;
  isDeleted: boolean;
}

export interface IQueryUser {
  identifier?: string;
  type: ETypeSearchUser;
}

export interface IQueryBabysitter extends IQuery {
  createdAtFrom?: string;
  createdAtTo?: string;
  allowBooking?: boolean;
  lang?: ELanguage;
  sort?: ESortBabysitter;
  cityId?: string;
  dates?: Date[];
  salaries?: number[];
  ages?: EFilterAge[];
  languageIds?: string[];
  numberOfExperience?: ENumberOfExperience;
  rating?: ERating;
  currencyId?: string;
}

export type UpdateBabysitterAllowBookingStatus =
  IBabysitterAllowBookingStatus[];

export interface IBabysitterAllowBookingStatus {
  babysitterId: string;
  allowBooking: boolean;
}

export interface ICreateBabysitter {
  userLanguages: IUserLanguage[];
  babysitterSpecialServices: IBabysitterSpecialService[];
  userImages: IUserImage[];
  isMarketingAccount: boolean;
  username: string;
  email: string;
  gender: EnumGender;
  dob: string;
  salary: number;
  currencyId: string;
  cityId: string;
  countryId: string;
  numChild: ENumberOfChild;
  numExperience: ENumberOfExperience;
  introduce: string;
  booking: IBookingAdmin;
  phone: string;
  estimateIncome: number;
}

export interface IBookingAdmin {
  reviewIds: string[];
  bookingTimes: BookingTime[];
  point: number;
  comment: string;
  commentImages: string[];
}

export interface BookingTime {
  startTime: string;
  endTime: string;
}
