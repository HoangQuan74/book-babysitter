import { ELanguageLevel } from '@lib/common/enums';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class UserLanguageDto {
  @ApiProperty({ type: String })
  @IsUUID()
  languageId: string;

  @ApiProperty({ enum: ELanguageLevel })
  @IsEnum(ELanguageLevel)
  level: ELanguageLevel;
}

export class updateUserLanguageDto extends PartialType(UserLanguageDto) {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsUUID()
  id: string;
}
