import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmpty, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class UserImageDto {
  @ApiProperty({ type: String })
  @IsString()
  key: string;

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsInt()
  order: number;
}

export class UpdateUserImageDto extends PartialType(UserImageDto) {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsUUID()
  id: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  url: string;
}
