import { EStatisticsBabysitterList } from '@lib/common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class QueryStatisticsBabysitterRegion {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsUUID('4', { each: true })
  cityIds: string[];
}

export class QueryStatisticsBabysitterList {
  @ApiProperty({ enum: EStatisticsBabysitterList })
  @IsEnum(EStatisticsBabysitterList)
  type: string;
}
