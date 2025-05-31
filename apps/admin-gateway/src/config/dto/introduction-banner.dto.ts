import { EUserRole } from '@lib/common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class QueryIntroductionBannerDto {
  @ApiProperty({ enum: [EUserRole.BABY_SITTER, EUserRole.PARENT] })
  @IsEnum([EUserRole.BABY_SITTER, EUserRole.PARENT])
  type: EUserRole;
}

export class IntroductionBannerDto {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsUUID()
  id: string;

  @ApiProperty({ enum: [EUserRole.BABY_SITTER, EUserRole.PARENT] })
  @IsEnum([EUserRole.BABY_SITTER, EUserRole.PARENT])
  type: EUserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url: string;

  @ApiProperty()
  @IsString()
  key: string;
}

export class CreateIntroductionBannerDto {
  @ApiProperty({ type: [IntroductionBannerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IntroductionBannerDto)
  images: IntroductionBannerDto[];
}
