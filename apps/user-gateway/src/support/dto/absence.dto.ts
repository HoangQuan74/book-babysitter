import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class RequestAbsenceDto {
  @ApiProperty({ type: String })
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;
}
