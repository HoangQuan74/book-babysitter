import { ETypeSearchUser, EUserRole } from '@lib/common/enums';
import { PaginationQueryDto } from '@lib/common/query';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserQueryDto {
  @ApiPropertyOptional({ enum: ETypeSearchUser })
  @IsEnum(ETypeSearchUser)
  type: ETypeSearchUser;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  identifier: string;
}

export class QueryUserDeletedDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: [EUserRole.PARENT, EUserRole.BABY_SITTER] })
  @IsOptional()
  @IsEnum([EUserRole.PARENT, EUserRole.BABY_SITTER])
  role: EUserRole;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deletedFrom: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deletedTo: Date;
}
