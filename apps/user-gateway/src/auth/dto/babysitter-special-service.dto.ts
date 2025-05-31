import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class BabysitterSpecialServiceDto {
  @ApiProperty({ type: String })
  @IsUUID()
  specialServiceId: string;
}

export class UpdateBabysitterSpecialServiceDto extends PartialType(
  BabysitterSpecialServiceDto,
) {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsUUID()
  id: string;
}
