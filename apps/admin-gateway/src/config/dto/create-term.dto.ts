import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ETermDisplayStatus } from '@lib/common/enums';

export class CreateTermDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  isRequired: boolean;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  languageId: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  termTypeId: string;

  @ApiProperty({
    enum: [ETermDisplayStatus.DISPLAY, ETermDisplayStatus.HIDDEN],
  })
  @IsEnum([ETermDisplayStatus.DISPLAY, ETermDisplayStatus.HIDDEN])
  displayStatus: ETermDisplayStatus = ETermDisplayStatus.DISPLAY;
}
