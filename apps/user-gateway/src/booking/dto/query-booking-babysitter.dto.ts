import {
  EFilterAge,
  ENumberOfExperience,
  ERating,
  ESortBabysitter,
} from '@lib/common/enums';
import { PaginationQueryDto } from '@lib/common/query';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class QueryBookingBabysitterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  cityId: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  currencyId: string;

  @ApiPropertyOptional({ enum: ESortBabysitter })
  @IsOptional()
  @IsEnum(ESortBabysitter)
  sort: ESortBabysitter = ESortBabysitter.HIGHEST_SALARY;

  @ApiPropertyOptional({
    type: [String],
    example: ['2022-01-01', '2022-01-02'],
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  dates: Date[];

  @ApiPropertyOptional({ type: [Number], example: [1000, 2000] })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  salaries: number[];

  @ApiPropertyOptional({
    enum: EFilterAge,
    isArray: true,
    example: [EFilterAge.AGE_20, EFilterAge.AGE_30],
  })
  @IsOptional()
  @IsEnum(EFilterAge, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  ages: EFilterAge[];

  @ApiPropertyOptional({
    type: [String],
    example: [
      '34913559-6e45-4a86-b827-f89d91f5d2cc',
      '7da2bb03-93f2-49f4-874e-1d006c17fbb1',
    ],
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  languageIds?: string[];

  @ApiPropertyOptional({ enum: ENumberOfExperience })
  @IsOptional()
  @IsEnum(ENumberOfExperience)
  numberOfExperience: ENumberOfExperience;

  @ApiPropertyOptional({ enum: ERating })
  @IsOptional()
  @IsEnum(ERating)
  @Type(() => Number)
  rating: ERating;
}
