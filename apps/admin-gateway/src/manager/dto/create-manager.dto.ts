import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsEmail,
  IsArray,
} from 'class-validator';

export class CreateManagerDto {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  avatar: string;
  
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ type: String })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  hasAdminPermission: boolean = false;

  @ApiProperty({ type: String })
  @IsDateString()
  @IsNotEmpty()
  loginExpirationAt: Date;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[] = [];

  @ApiProperty({ type: String })
  @IsDateString()
  @IsNotEmpty()
  revokedAt: Date;
}
