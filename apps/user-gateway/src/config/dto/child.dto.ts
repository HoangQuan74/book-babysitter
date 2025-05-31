import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class AgeChildDto {
  @ApiProperty({ type: Number })
  @IsInt()
  @Type(() => Number)
  yob: number;

  @ApiProperty({ type: Number })
  @IsInt()
  @Type(() => Number)
  mob: number;
}
