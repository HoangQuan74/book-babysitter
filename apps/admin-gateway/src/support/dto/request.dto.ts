import { ERequestStatus, ERequestType } from '@lib/common/enums';
import { PaginationQueryDto } from '@lib/common/query';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class RequestQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ERequestType })
  @IsOptional()
  @IsEnum(ERequestType)
  type: ERequestType;

  @ApiPropertyOptional({ enum: ERequestStatus })
  @IsOptional()
  @IsEnum(ERequestStatus)
  status: ERequestStatus;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  })
  startDate: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  })
  endDate: Date;
}
