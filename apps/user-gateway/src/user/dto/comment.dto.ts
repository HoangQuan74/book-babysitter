import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsUUID()
  id: string;

  @ApiProperty({ type: String })
  @IsUUID()
  parentId: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class QueryRatingUserDetailDto {
  @ApiProperty()
  @IsUUID()
  ratingId: string;
}
