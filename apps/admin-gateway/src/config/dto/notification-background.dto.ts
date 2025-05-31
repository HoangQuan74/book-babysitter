import { MultilingualFieldsExtendENDto } from '@lib/common/dto';
import { ENotificationBackgroundType } from '@lib/core/databases/postgres/entities/notification-background.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, ValidateNested } from 'class-validator';

export class NotificationBackgroundDto {
  @ApiProperty({ enum: ENotificationBackgroundType })
  @IsEnum(ENotificationBackgroundType)
  type: ENotificationBackgroundType;

  @ApiProperty({ type: MultilingualFieldsExtendENDto })
  @ValidateNested()
  @Type(() => MultilingualFieldsExtendENDto)
  title: MultilingualFieldsExtendENDto;

  @ApiProperty({ type: MultilingualFieldsExtendENDto })
  @ValidateNested()
  @Type(() => MultilingualFieldsExtendENDto)
  content: MultilingualFieldsExtendENDto;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  isDisable: boolean;
}
