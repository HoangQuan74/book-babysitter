import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ImageRatingDto {
  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  url: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  key: string;
}

export class CommentRatingDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ type: [ImageRatingDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageRatingDto)
  images: ImageRatingDto;
}

export class CreateRatingUserDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  id: string;
  
  @ApiProperty({ type: String })
  @IsUUID()
  babysitterId: string;

  @ApiProperty({ type: String })
  @IsUUID()
  bookingId: string;

  @ApiProperty({ type: Number })
  @IsInt()
  @Min(1)
  @Max(5)
  point: number;

  @ApiPropertyOptional({ type: CommentRatingDto })
  @IsOptional()
  @Type(() => CommentRatingDto)
  @ValidateNested()
  @IsObject()
  comment: CommentRatingDto;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  reviewIds: string[];
}
