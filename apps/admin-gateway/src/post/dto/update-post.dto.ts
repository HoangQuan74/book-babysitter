import { ETargetUserType } from '@lib/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class FileUpload {
  @ApiProperty({ type: String })
  @IsString()
  key: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  index: number;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  url: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  id: string;
}

export class UpdatePostDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  typeId: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  countryId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  content: string;

  @ApiProperty({ type: FileUpload, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileUpload)
  files: FileUpload[];

  @ApiProperty({ enum: ETargetUserType, default: ETargetUserType.ALL })
  @IsEnum(ETargetUserType)
  @IsOptional()
  targetUserType: ETargetUserType;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isVisible: boolean;
}
