import { PaginationQueryDto } from '@lib/common/query';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class QueryPostCommentDto extends PaginationQueryDto {
  @ApiProperty()
  @IsUUID()
  postId: string;
}
