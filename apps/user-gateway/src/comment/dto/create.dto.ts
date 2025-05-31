import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsUUID()
  postId: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  commentRootId: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  commentParentId: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  taggedUserId: string;
}
