import { EDevicePlatform } from '@lib/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UserDeviceDto {
  @ApiProperty({ type: String })
  @IsString()
  deviceId: string;

  @ApiProperty({ type: String })
  @IsString()
  fcmToken: string;

  @ApiProperty({
    type: EDevicePlatform,
    enum: EDevicePlatform,
    default: EDevicePlatform.ANDROID,
  })
  @IsString()
  platform: EDevicePlatform;

  @ApiProperty({ type: Object, required: false })
  @IsOptional()
  metadata: { key: string };
}
