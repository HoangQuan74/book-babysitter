import {
  ENotificationChannel,
  ENotificationStatus,
} from '@lib/core/databases/postgres/entities';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class QueryNotificationDto {
  @ApiProperty({ default: 1 })
  @IsNotEmpty()
  page: number;

  @ApiProperty({ default: 10 })
  @IsNotEmpty()
  limit: number;

  @ApiProperty({ type: ENotificationChannel, required: false })
  @IsOptional()
  @IsEnum(ENotificationChannel)
  channel: ENotificationChannel;

  @ApiProperty({ type: ENotificationStatus, required: false })
  @IsOptional()
  @IsEnum(ENotificationStatus)
  status: ENotificationStatus;
}
