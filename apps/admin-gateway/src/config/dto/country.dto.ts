import { MultilingualFieldDto } from '@lib/common/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class QueryCountryDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  countryId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isUserCreated: boolean = false;
}

export class CityDto {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsUUID()
  id: string;

  @ApiProperty({ type: MultilingualFieldDto })
  @ValidateNested()
  @Type(() => MultilingualFieldDto)
  name: MultilingualFieldDto;
}
export class CountryDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  id: string;

  @ApiProperty({ type: MultilingualFieldDto })
  @ValidateNested()
  @Type(() => MultilingualFieldDto)
  name: MultilingualFieldDto;

  @ApiPropertyOptional({ type: [CityDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CityDto)
  cities: CityDto[];
}
export class UpsertCountryDto {
  @ApiProperty({ type: [CountryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CountryDto)
  countries: CountryDto[];
}
