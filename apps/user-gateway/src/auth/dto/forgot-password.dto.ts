import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({ type: String, example: 'admin@gtrip.io' })
  @IsEmail()
  email: string;
}

export class VerifyResetOtpDto {
  @ApiProperty({ type: String, example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ type: String, example: 'admin@gtrip.io' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ type: String, example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ type: String, example: 'admin@gtrip.io' })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, example: '123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
