import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestContactDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
