import { ELanguageLevel } from '@lib/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsUUID } from 'class-validator';

export class UsertermDto {
  @ApiProperty({ type: String })
  @IsUUID()
  termId: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  isAgreed: boolean;
}
