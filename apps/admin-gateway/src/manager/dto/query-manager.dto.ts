import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { BaseQueryDto } from '@lib/common/query';
import { Transform } from 'class-transformer';

export class QueryManagerDto extends BaseQueryDto {
  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasAdminPermission: boolean;
}
