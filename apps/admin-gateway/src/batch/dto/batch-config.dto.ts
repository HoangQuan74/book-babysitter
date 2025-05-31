import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class BatchConfigDto {
  @ApiProperty({ default: 7 })
  @IsNumber()
  duration: number;
}
