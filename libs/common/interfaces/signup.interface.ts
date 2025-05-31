import {
  ENumberOfChild,
  ENumberOfExperience,
  EnumGender,
  EOtpType,
  EUserRole,
} from '../enums';
import {
  IBabysitterSpecialService,
  IUserImage,
  IUserLanguage,
  IUserTerm,
} from '.';

export interface ISignup {
  id: string;
  username: string;
  userLanguages: IUserLanguage[];
  userTerms: IUserTerm[];
  userImages?: IUserImage[];
  babysitterSpecialServices?: IBabysitterSpecialService[];
  gender?: EnumGender;
  dob?: string;
  phone?: string;
  cityId?: string;
  introduce?: string;
  numChild?: ENumberOfChild;
  numExperience?: ENumberOfExperience;
  salary?: number;
  currencyId?: string;
  completedSignup?: string;
}

export interface IVerifySignUpOtp {
  email: string;
  otp: string;
  // userRole: EUserRole;
  // languageCode: string;
}

export interface ISetPassword {
  email: string;
  password: string;
  userRole: EUserRole;
  languageCode: string;
  otp: string;
}

export interface IResendOtp {
  email: string;
  type: EOtpType;
}
