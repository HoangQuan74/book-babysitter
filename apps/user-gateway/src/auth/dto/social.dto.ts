import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SocialCallbackDto {
  @ApiProperty({ example: 'google' })
  provider: string;

  @ApiProperty()
  socialId: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  name: string;
}
