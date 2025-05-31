import {
  errorMessage,
  MINIMUM_WORKING_TIME,
  ONE_HOUR,
} from '@lib/common/constants';
import {
  EBookingStatus,
  EGenderForBaby,
  ENumOfChildrenCared,
} from '@lib/common/enums';
import { BadRequestException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

class BookingTimeDto {
  @ApiProperty({ type: Date })
  @IsDateString()
  @IsNotEmpty()
  @ValidateIf((o) => {
    const startTime = new Date(o.startTime).getTime() / 1000;
    const endTime = new Date(o.endTime).getTime() / 1000;
    const now = new Date().getTime() / 1000;

    if (startTime - now < ONE_HOUR)
      throw new BadRequestException(errorMessage.BOOKING_TIME_NOT_VALID);

    const isValidTime = endTime - startTime >= MINIMUM_WORKING_TIME;

    if (!isValidTime && o?.status !== EBookingStatus.DRAFT)
      throw new BadRequestException(errorMessage.MINIMUM_WORKING_TIME);
    return true;
  })
  startTime: Date;

  @ApiProperty({ type: Date })
  @IsDateString()
  @IsNotEmpty()
  endTime: Date;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  hasBreakTime: boolean;

  @ApiProperty({
    enum: [EBookingStatus.DRAFT, EBookingStatus.PENDING],
    example: EBookingStatus.PENDING,
  })
  @IsEnum([EBookingStatus.DRAFT, EBookingStatus.PENDING])
  @IsOptional()
  status: EBookingStatus;
}
class BookingChildrenDto {
  @ApiProperty({ type: Date })
  @IsDateString()
  @IsNotEmpty()
  dob: Date;

  @ApiProperty({ enum: EGenderForBaby })
  @IsEnum(EGenderForBaby)
  @IsNotEmpty()
  gender: EGenderForBaby;
}
export class CreateBookingDto {
  @ApiProperty({ type: String })
  @IsUUID()
  babysitterId: string;

  @ApiProperty({
    enum: [EBookingStatus.DRAFT, EBookingStatus.PENDING],
    example: EBookingStatus.PENDING,
  })
  @IsEnum([EBookingStatus.DRAFT, EBookingStatus.PENDING])
  status: EBookingStatus;

  @ApiProperty({ type: String })
  @IsUUID()
  @IsOptional()
  countryId: string;

  @ApiProperty({ type: String })
  @IsUUID()
  @IsOptional()
  cityId: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address: string;

  @ApiProperty({ enum: ENumOfChildrenCared })
  @IsEnum(ENumOfChildrenCared)
  @IsOptional()
  numOfChildrenCared: ENumOfChildrenCared;

  @ApiProperty({ type: [BookingTimeDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BookingTimeDto)
  @IsOptional()
  bookingTimes: BookingTimeDto[];

  @ApiProperty({ type: [BookingChildrenDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BookingChildrenDto)
  @IsOptional()
  bookingChildren: BookingChildrenDto[];

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  message: string;
}
