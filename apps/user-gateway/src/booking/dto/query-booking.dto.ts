import { EBookingStatus } from '@lib/common/enums';
import { PaginationQueryDto } from '@lib/common/query';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class QueryBookingDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: EBookingStatus, isArray: true })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsEnum(EBookingStatus, { each: true })
  status: EBookingStatus[];
}

export class QueryBookingNotificationDto {
  @ApiProperty({ enum: EBookingStatus, isArray: true })
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsEnum(EBookingStatus, { each: true })
  status: EBookingStatus[];
}

export class QueryBookingScheduleDto {
  @ApiProperty({ type: Date })
  @Transform(({ value }) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  })
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiProperty({ type: Date })
  @Transform(({ value }) => {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date;
  })
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
