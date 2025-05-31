import * as otpGenerator from 'otp-generator';

export const generateOtp = (length: number) => {
  return otpGenerator.generate(length, {
    upperCaseAlphabets: true,
    specialChars: false,
  });
};
