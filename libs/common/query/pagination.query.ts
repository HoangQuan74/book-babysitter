import { ApiPropertyOptional } from "@nestjs/swagger";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "../constants";
import { Type } from "class-transformer";
import { IsInt, IsPositive, Min } from "class-validator";

export class PaginationQueryDto {
  @ApiPropertyOptional({
    name: 'limit',
    description: 'Number of items per page',
    required: false,
    default: DEFAULT_LIMIT,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  limit: number;

  @ApiPropertyOptional({
    name: 'page',
    description: 'Page number',
    default: DEFAULT_PAGE,
    required: false,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page: number;
}
