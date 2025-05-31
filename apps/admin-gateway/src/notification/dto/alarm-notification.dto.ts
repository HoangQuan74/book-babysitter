import { ETargetAlarm } from '@lib/core/databases/postgres/entities';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class AlarmNotificationDto {
  @ApiProperty({ type: String })
  @IsString()
  content: string;
}

export class QueryAlarmNotificationDto {
  @ApiProperty({ type: ETargetAlarm })
  @IsEnum(ETargetAlarm)
  target: ETargetAlarm;
}
