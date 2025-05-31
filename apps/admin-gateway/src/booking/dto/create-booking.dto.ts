import {
  errorMessage,
  MINIMUM_WORKING_TIME,
  ONE_HOUR,
} from '@lib/common/constants';
import { EGenderForBaby, ENumOfChildrenCared } from '@lib/common/enums';
import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import * as moment from 'moment';

class BookingTimesDto {
  @ApiProperty({ type: Date })
  @IsDateString()
  @IsNotEmpty()
  @ValidateIf((o) => {
    const startTime = moment(o.startTime).utcOffset(7);
    const endTime = moment(o.endTime).utcOffset(7);
    const now = moment().utcOffset(7);

    if (startTime.unix() - now.unix() < ONE_HOUR) {
      throw new BadRequestException(errorMessage.BOOKING_TIME_NOT_VALID);
    }

    if (startTime.format('YYYY-MM-DD') !== endTime.format('YYYY-MM-DD')) {
      throw new BadRequestException(errorMessage.BOOKING_TIME_NOT_VALID);
    }

    const isValidTime =
      endTime.unix() - startTime.unix() >= MINIMUM_WORKING_TIME;

    if (!isValidTime)
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
}

class BookingChildrenDto {
  @ApiProperty({ type: Date })
  @IsDateString()
  @IsNotEmpty()
  dob: Date;

  @ApiProperty({ enum: EGenderForBaby })
  @IsEnum(EGenderForBaby)
  @IsNotEmpty()
  gender: string;
}

export class CreateBookingDto {
  @ApiProperty({ type: String })
  @IsUUID()
  countryId: string;

  @ApiProperty({ type: String })
  @IsUUID()
  cityId: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ enum: ENumOfChildrenCared })
  @IsEnum(ENumOfChildrenCared)
  @IsNotEmpty()
  numOfChildrenCared: ENumOfChildrenCared;

  @ApiProperty({ type: [BookingTimesDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingTimesDto)
  @ValidateIf((o) => {
    const dates = o.bookingTimes.map((item) =>
      moment(item.startTime).utcOffset(7).format('YYYY-MM-DD'),
    );
    const uniqueDates = new Set(dates);
    if (uniqueDates.size !== dates.length) {
      throw new BadRequestException(errorMessage.BOOKING_TIME_NOT_VALID);
    }
    return true;
  })
  bookingTimes: BookingTimesDto[];

  @ApiProperty({ type: [BookingChildrenDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BookingChildrenDto)
  bookingChildren: BookingChildrenDto[];

  @ApiProperty({ type: String })
  @IsUUID()
  @IsNotEmpty()
  parentId: string;

  @ApiProperty({ type: String })
  @IsUUID()
  @IsNotEmpty()
  babysitterId: string;
}
