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

class FileUploadCreateDto {
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
  id: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  directUrl: string;
}

export class CreatePostDto {
  @ApiProperty()
  @IsUUID()
  typeId: string;

  @ApiProperty()
  @IsUUID()
  countryId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ type: FileUploadCreateDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileUploadCreateDto)
  files: FileUploadCreateDto[];

  @ApiProperty({ enum: ETargetUserType, default: ETargetUserType.ALL })
  @IsEnum(ETargetUserType)
  targetUserType: ETargetUserType;

  @ApiProperty({ default: true })
  @IsBoolean()
  isVisible: boolean;
}
