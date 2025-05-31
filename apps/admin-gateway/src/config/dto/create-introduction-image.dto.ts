import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EUserRole } from '@lib/common/enums';

class IntroductionImageDto {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsUUID()
  id: string;

  @ApiProperty({ type: Number })
  @IsInt()
  order: number;

  @ApiProperty({ type: String })
  @IsString()
  key: string;

  @ApiProperty({ type: String })
  @IsOptional()
  url: string;
}

export class CreateIntroductionImagesDto {
  @ApiProperty({ type: [IntroductionImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IntroductionImageDto)
  images: IntroductionImageDto[];

  @ApiPropertyOptional({ enum: [EUserRole.BABY_SITTER, EUserRole.PARENT] })
  @IsOptional()
  @IsEnum([EUserRole.BABY_SITTER, EUserRole.PARENT])
  type: EUserRole = EUserRole.BABY_SITTER;
}

export class QueryIntroductionImageDto {
  @ApiPropertyOptional({ enum: [EUserRole.BABY_SITTER, EUserRole.PARENT] })
  @IsOptional()
  @IsEnum([EUserRole.BABY_SITTER, EUserRole.PARENT])
  type: EUserRole = EUserRole.BABY_SITTER;
}
