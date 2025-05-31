import { EUserRole } from '@lib/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CancelBookingDto {
  @ApiProperty({ type: String })
  @IsUUID()
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  reasonCancel: string;

  @ApiProperty({ enum: [EUserRole.BABY_SITTER, EUserRole.PARENT] })
  @IsEnum([EUserRole.BABY_SITTER, EUserRole.PARENT])
  canceledBy: EUserRole;
}
