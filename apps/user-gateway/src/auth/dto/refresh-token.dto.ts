import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
