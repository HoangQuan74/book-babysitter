import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination.query';

export class BaseQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    name: 'q',
    description: 'Search query',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  q: string;
}
