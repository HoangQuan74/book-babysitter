import { PaginationQueryDto } from '@lib/common/query';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryPostDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search: string;
}

export class QueryMyPostDto extends PaginationQueryDto {}

export class QueryPostDetail {
  @ApiProperty()
  @IsUUID()
  id: string;
}
