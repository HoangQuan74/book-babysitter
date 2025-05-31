import {
  errorMessage,
  MINIMUM_WORKING_TIME,
  ONE_HOUR,
} from '@lib/common/constants';
import {
  ELanguageLevel,
  ENumberOfChild,
  ENumberOfExperience,
  EnumGender,
} from '@lib/common/enums';
import { PaginationQueryDto } from '@lib/common/query';
import { BadRequestException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class QueryBabysitterDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  createdAtFrom: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  createdAtTo: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  allowBooking: boolean;
}

export class UpdateAllowBookingBabysitterDto {
  @ApiProperty()
  @IsUUID()
  babysitterId: string;

  @ApiPropertyOptional()
  @IsBoolean()
  allowBooking: boolean;
}

export class UpdateListAllowBookingBabysitterDto {
  @ApiProperty({ type: [UpdateAllowBookingBabysitterDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAllowBookingBabysitterDto)
  allowBookings: UpdateAllowBookingBabysitterDto[];
}

export class UserLanguageDto {
  @ApiProperty({ type: String })
  @IsUUID()
  languageId: string;

  @ApiProperty({ enum: ELanguageLevel })
  @IsEnum(ELanguageLevel)
  level: ELanguageLevel;
}

export class UserImageDto {
  @ApiProperty({ type: String })
  @IsString()
  key: string;

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsInt()
  order: number;
}

export class BabysitterSpecialServiceDto {
  @ApiProperty({ type: String })
  @IsUUID()
  specialServiceId: string;
}

export class BookingTimeDto {
  @ApiProperty({ type: Date })
  @IsDateString()
  @IsNotEmpty()
  @ValidateIf((o) => {
    const startTime = new Date(o.startTime).getTime() / 1000;
    const endTime = new Date(o.endTime).getTime() / 1000;
    const now = new Date().getTime() / 1000;

    const isValidTime = endTime - startTime >= MINIMUM_WORKING_TIME;

    if (!isValidTime)
      throw new BadRequestException(errorMessage.MINIMUM_WORKING_TIME);
    return true;
  })
  startTime: Date;

  @ApiProperty({ type: Date })
  @IsDateString()
  @IsNotEmpty()
  endTime: Date;
}

export class BookingDto {
  @ApiProperty({ type: [BookingTimeDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BookingTimeDto)
  bookingTimes: BookingTimeDto[];

  @ApiProperty({ type: Number })
  @IsInt()
  @Max(5)
  @Min(1)
  point: number;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  comment: string;

  @ApiPropertyOptional({ type: Array })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  commentImages: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  reviewIds: string[] = [];
}

export class CreateBabysitterDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ type: String })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  phone: string;

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

  @ApiProperty({ type: [UserLanguageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserLanguageDto)
  userLanguages: UserLanguageDto[] = [];

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsInt()
  salary: number;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsUUID()
  currencyId: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsUUID()
  cityId: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsUUID()
  countryId: string;

  @ApiProperty({ enum: ENumberOfChild })
  @IsOptional()
  @IsEnum(ENumberOfChild)
  numChild: ENumberOfChild;

  @ApiProperty({ enum: ENumberOfExperience })
  @IsOptional()
  @IsEnum(ENumberOfExperience)
  numExperience: ENumberOfExperience;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  introduce: string;

  @ApiProperty({ type: [BabysitterSpecialServiceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BabysitterSpecialServiceDto)
  babysitterSpecialServices: BabysitterSpecialServiceDto[] = [];

  @ApiProperty({ type: [UserImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserImageDto)
  userImages: UserImageDto[] = [];

  @ApiPropertyOptional({ type: BookingDto })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BookingDto)
  booking: BookingDto;

  @ApiProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isMarketingAccount: boolean = true;

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsInt()
  estimateIncome: number;

  completedSignup: Date = new Date();
}
