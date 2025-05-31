import { EUserRole } from "../enums";

export interface ILogin {
  email: string;
  password: string;
  app?: EUserRole;
}

export interface IVerifyOtp {
  userId: string;
  otp: string;
}

export interface IJwtPayload {
  userId: string;
  role: string;
  username: string;
  sessionId: string;
}
