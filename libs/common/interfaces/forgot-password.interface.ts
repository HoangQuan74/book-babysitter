export interface IRequestPasswordReset {
  email: string;
}

export interface IVerifyResetOtp {
  otp: string;
  email: string;
}

export interface IResetPassword {
  otp: string;
  email: string;
  newPassword: string;
}
