import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

class SpecialServiceDetail {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  id: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsString()
  shortContent: string;
}

export class CreateSpecialServiceDto {
  @ApiProperty({ default: 'vi' })
  @IsString()
  langCode: string;

  @ApiProperty({ type: SpecialServiceDetail, isArray: true })
  @Type(() => SpecialServiceDetail)
  @IsArray()
  details: SpecialServiceDetail[];
}
