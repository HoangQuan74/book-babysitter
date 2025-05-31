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
  categoryId: string;

  @ApiProperty()
  @IsUUID()
  cityId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ type: FileUpload, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileUpload)
  files: FileUpload[];
}
