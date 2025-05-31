import { EOtpType, EUserRole } from '@lib/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  ValidateIf,
  IsIn,
  IsUUID,
  IsEmail,
} from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ type: String })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ResendOtpDto {
  @ApiProperty({ type: String })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: EOtpType })
  @IsIn([EOtpType.USER_RESET_PASSWORD, EOtpType.USER_SIGNUP], {
    message: 'type must be either user_reset_password or user_signup',
  })
  type: EOtpType;
}
