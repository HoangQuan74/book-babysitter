import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QueryConversationDto {
  @ApiProperty({ required: true })
  @IsString()
  userCode: string;

  @ApiProperty({ default: 10 })
  @IsNotEmpty()
  limit: number;

  @ApiProperty({ default: 1 })
  @IsNotEmpty()
  page: number;
}
