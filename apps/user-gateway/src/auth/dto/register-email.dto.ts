import { EUserRole } from '@lib/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterEmailDto {
  @ApiProperty({ type: String })
  @IsEmail()
  email: string;
}

export class SetPasswordDto {
  @ApiProperty({ type: String })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  otp: string;

  userRole: EUserRole;
  languageCode: string;
}
