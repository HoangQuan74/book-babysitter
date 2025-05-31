import { EFaqDisplayStatus, EFaqType } from '@lib/common/enums';
import { PaginationQueryDto } from '@lib/common/query';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class FaqQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: EFaqType })
  @IsOptional()
  @IsEnum(EFaqType)
  faqType: EFaqType;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  languageId: string;

  @ApiPropertyOptional({ enum: EFaqDisplayStatus })
  @IsOptional()
  @IsEnum(EFaqDisplayStatus)
  displayStatus: string;
}

export class CreateFaqDto {
  @ApiProperty({ type: String })
  @IsUUID()
  languageId: string;

  @ApiProperty({ enum: EFaqType })
  @IsEnum(EFaqType)
  faqType: EFaqType;

  @ApiProperty({ enum: EFaqDisplayStatus })
  @IsEnum(EFaqDisplayStatus)
  displayStatus: EFaqDisplayStatus;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateFaqDto extends PartialType(CreateFaqDto) {
  @ApiProperty({ type: String })
  @IsUUID()
  id: string;
}
