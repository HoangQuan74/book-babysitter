import { ERankingType } from '@lib/core/databases/postgres/entities/babysitter-ranking.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class QueryBabysitterRankingDto {
  @ApiProperty({ enum: ERankingType })
  @IsEnum(ERankingType)
  type: ERankingType;
}
