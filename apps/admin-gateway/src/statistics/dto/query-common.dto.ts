import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import * as moment from 'moment';

export class QueryStatisticsCommonDto {
  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Transform(({ value }) => {
    const date = moment(value).utcOffset(7).startOf('day').toDate();
    return date;
  })
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Transform(({ value }) => {
    const date = moment(value).utcOffset(7).endOf('day').toDate();
    return date;
  })
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
