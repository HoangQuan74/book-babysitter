import { ERequestStatus } from '@lib/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';

export class UpdateRequestContactDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ enum: ERequestStatus })
  @IsEnum(ERequestStatus)
  status: ERequestStatus;
}
