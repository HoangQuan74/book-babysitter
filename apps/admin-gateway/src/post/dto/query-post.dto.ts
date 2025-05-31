import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

class SortPost {
  @ApiProperty({ default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  createdAt: string;
}

export class QueryPostDto {
  @ApiProperty({ type: Number, default: 1 })
  @IsNotEmpty()
  page: number;

  @ApiProperty({ type: Number, default: 10 })
  @IsNotEmpty()
  limit: number;
}

class SearchPost {
  @ApiProperty()
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  owner: string;
}

export class FilterPostDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  typeId: string;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  createdAt: Date;

  @ApiProperty({ type: SortPost, required: false })
  @IsOptional()
  @Type(() => SortPost)
  @IsObject()
  sort: SortPost;

  @ApiProperty({ type: Boolean, default: true })
  @IsOptional()
  isVisible: boolean;

  @ApiProperty({ type: SearchPost })
  @IsOptional()
  search: SearchPost;
}

export class QueryPostTypeDto {
  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive: boolean;
}
