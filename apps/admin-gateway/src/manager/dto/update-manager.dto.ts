import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateManagerDto } from '.';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class UpdateManagerDto extends OmitType(CreateManagerDto, [
  'permissionIds',
]) {
  @ApiProperty({ type: String })
  @IsUUID()
  id: string;

  @ApiProperty({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
