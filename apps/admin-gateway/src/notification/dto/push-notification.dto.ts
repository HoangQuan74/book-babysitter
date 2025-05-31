import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

enum ETargetReceiver {
  ALL = 'all',
  SPECIAL = 'special',
  BABY_SITTER = 'babysitter',
  PARENT = 'parent',
}

class FileUpload {
  @ApiProperty({ type: String })
  @IsString()
  key: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  id: string;
}

export class NotificationDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsEnum(ETargetReceiver)
  targetReceiver: ETargetReceiver;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ type: Date })
  @IsDateString()
  @IsOptional()
  @IsNotEmpty()
  sendTime: Date;

  @ApiProperty()
  @IsOptional()
  @Type(() => FileUpload)
  file: FileUpload;
}

export class NotificationPushDto extends NotificationDto {
  @ApiProperty({ type: String })
  @IsUUID()
  pushTypeId: string;

  @ApiProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isAndroidApplied: boolean;

  @ApiProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isIosApplied: boolean;
}

class Notification {
  @ApiProperty({ type: String })
  @IsString()
  title: string;

  @ApiProperty({ type: String })
  @IsString()
  body: string;
}
export class PushNotificationDto {
  @ApiProperty({ type: String })
  @IsUUID()
  userId: string;

  @ApiProperty({ type: Notification })
  @IsNotEmpty()
  notification: Notification;

  @ApiProperty({ type: Object })
  @IsOptional()
  params: Object;
}

export class GeneralNotificationDto {
  @ApiProperty({ type: String })
  @IsString()
  title: string;

  @ApiProperty({ type: String })
  @IsString()
  content: string;

  @ApiProperty()
  @IsBoolean()
  isVisible: Boolean;

  @ApiProperty()
  @IsEnum(ETargetReceiver)
  targetReceiver: ETargetReceiver;

  @ApiProperty()
  @IsString()
  languageCode: string;

  @ApiProperty({ type: FileUpload, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileUpload)
  files: FileUpload[];
}

export class QueryGeneralNotificationDto {
  @ApiProperty({ default: 1 })
  @IsNotEmpty()
  page: number;

  @ApiProperty({ default: 10 })
  @IsNotEmpty()
  limit: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isVisible: Boolean;

  @ApiProperty({ required: false })
  @IsEnum(ETargetReceiver)
  @IsOptional()
  targetReceiver: ETargetReceiver;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  languageCode: string;
}
