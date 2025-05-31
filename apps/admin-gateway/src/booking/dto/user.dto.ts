import { EUserRole } from '@lib/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class QueryUserDto {
  @ApiProperty({ enum: [EUserRole.BABY_SITTER, EUserRole.PARENT] })
  @IsEnum([EUserRole.BABY_SITTER, EUserRole.PARENT])
  role: EUserRole;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  userCode: string;
}
