import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelBookingDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  reasonCancel: string
}