import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ type: String, example: 'admin@gtrip.io' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String, example: '123456' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
