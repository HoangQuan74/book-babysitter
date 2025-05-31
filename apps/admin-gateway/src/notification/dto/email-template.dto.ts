import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateEmailTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty()
  @IsString()
  html: string;
}

export class QueryEmailTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;
}

export class SendEmailDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsArray()
  receivers: string[];

  @ApiProperty({ example: { otp: 'dsakhdks' } })
  params: Object;
}
