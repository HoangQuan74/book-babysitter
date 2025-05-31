import {
  ECurrency,
  ENumberOfChild,
  ENumberOfExperience,
  EnumGender,
} from '@lib/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { UserLanguageDto } from './user-language.dto';
import { Transform, Type } from 'class-transformer';
import { UsertermDto } from './user-term.sto';
import { UserImageDto } from './user-image.dto';
import { BabysitterSpecialServiceDto } from './babysitter-special-service.dto';

export class SignUpDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ type: [UserLanguageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserLanguageDto)
  userLanguages: UserLanguageDto[] = [];

  @ApiProperty({ type: [UsertermDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UsertermDto)
  userTerms: UsertermDto[] = [];

  @ApiProperty({ type: [UserImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserImageDto)
  userImages: UserImageDto[] = [];

  @ApiProperty({ type: [BabysitterSpecialServiceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BabysitterSpecialServiceDto)
  babysitterSpecialServices: BabysitterSpecialServiceDto[] = [];

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

  @ApiProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isCompletedSignup: boolean;

  completedSignup?: Date;
}
