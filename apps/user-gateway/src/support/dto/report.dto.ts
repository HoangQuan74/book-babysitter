import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ReportDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ type: String })
  @IsUUID()
  accusedId: string;
}
