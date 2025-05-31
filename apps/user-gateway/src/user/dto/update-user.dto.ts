import {
  ENumberOfChild,
  ENumberOfExperience,
  EnumGender,
} from '@lib/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  UpdateBabysitterSpecialServiceDto,
  updateUserLanguageDto,
  UpdateUserImageDto,
} from '../../auth/dto';

export class UpdateUserDto {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  username: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  avatar: string;

  @ApiProperty({ type: [updateUserLanguageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => updateUserLanguageDto)
  userLanguages: updateUserLanguageDto[];

  @ApiProperty({ type: [UpdateUserImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserImageDto)
  userImages: UpdateUserImageDto[];

  @ApiProperty({ type: [UpdateBabysitterSpecialServiceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBabysitterSpecialServiceDto)
  babysitterSpecialServices: UpdateBabysitterSpecialServiceDto[];

  @ApiProperty({ enum: EnumGender })
  @IsOptional()
  @IsEnum(EnumGender)
  gender: EnumGender;

  @ApiProperty({ type: String, example: '2002' })
  @IsOptional()
  @Transform(({ value }) => {
    if (/^\d{4}$/.test(value)) {
      return `${value}-01-01`;
    }
    return value;
  })
  @IsDateString({}, { message: 'year of birth is not valid' })
  dob: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  phone: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsUUID()
  cityId: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  introduce: string;

  @ApiProperty({ enum: ENumberOfChild })
  @IsOptional()
  @IsEnum(ENumberOfChild)
  numChild: ENumberOfChild;

  @ApiProperty({ enum: ENumberOfExperience })
  @IsOptional()
  @IsEnum(ENumberOfExperience)
  numExperience: ENumberOfExperience;

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsInt()
  salary: number;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsUUID()
  currencyId: string;
}
