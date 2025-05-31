import { ERankingType } from '@lib/core/databases/postgres/entities/babysitter-ranking.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsUUID } from 'class-validator';

export class QueryBabysitterRankingDto {
  @ApiProperty({ enum: ERankingType })
  @IsEnum(ERankingType)
  type: ERankingType;
}

export class BabysitterRankingDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  babysitterIds: string[] = [];

  @ApiProperty({ enum: ERankingType })
  @IsEnum(ERankingType)
  type: ERankingType;
}
