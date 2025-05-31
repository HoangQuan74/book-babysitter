import { ScheduleType } from '@lib/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum } from 'class-validator';

export class QueryScheduleDto {
  @ApiProperty({
    enum: ScheduleType,
    description: 'Type of schedule: week or month',
  })
  @IsEnum(ScheduleType)
  scheduleType: ScheduleType;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  date: Date;
}
