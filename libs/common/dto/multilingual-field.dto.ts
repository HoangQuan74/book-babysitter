import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class MultilingualFieldDto {
  @ApiProperty({ example: '한국어 텍스트', description: 'Korean text' })
  @IsString()
  ko: string;

  @ApiProperty({
    example: 'Văn bản tiếng Việt',
    description: 'Vietnamese text',
  })
  @IsString()
  vi: string;
}

export class MultilingualFieldsExtendENDto extends MultilingualFieldDto {
  @ApiProperty({ example: 'English text', description: 'English text' })
  @IsString()
  en: string;
}

export class PagingDto {
  @ApiProperty({ default: 1 })
  @IsString()
  page: number;

  @ApiProperty({ default: 10 })
  @IsString()
  limit: number;
}
