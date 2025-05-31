import { errorMessage } from '@lib/common/constants';
import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CurrencyDto {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsUUID()
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  minSalary: number;

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  @ValidateIf((o) => {
    if (o.maxSalary < o.minSalary) {
      throw new BadRequestException(errorMessage.INVALID_CURRENCY_INFO);
    }
    return true;
  })
  maxSalary: number;

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  step: number;
}

export class CurrenciesDto {
  @ApiProperty({ type: [CurrencyDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CurrencyDto)
  currencies: CurrencyDto[];
}
