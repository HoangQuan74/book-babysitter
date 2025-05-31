import {
  ESearchTerm,
  EStatusTerm,
  ETermDisplayStatus,
} from '@lib/common/enums';
import { BaseQueryDto } from '@lib/common/query';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class TermQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  termTypeId: string;

  @ApiPropertyOptional({ enum: ETermDisplayStatus })
  @IsOptional()
  @IsEnum(ETermDisplayStatus)
  displayStatus: ETermDisplayStatus;

  @ApiPropertyOptional({ enum: EStatusTerm })
  @IsOptional()
  @IsEnum(EStatusTerm)
  status: EStatusTerm;

  @ApiPropertyOptional({ enum: ESearchTerm })
  @IsOptional()
  @IsEnum(ESearchTerm)
  typeSearch: ESearchTerm;
}
