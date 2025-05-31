import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ReactPostDto {
  @ApiProperty({ type: String })
  @IsUUID()
  postId: string;
}
