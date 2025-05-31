import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateTermDto } from './create-term.dto';
import { ETermDisplayStatus } from '@lib/common/enums';
import { IsEnum } from 'class-validator';

export class UpdateTermDto extends OmitType(PartialType(CreateTermDto), [
  'displayStatus',
]) {
  @ApiProperty({
    enum: [ETermDisplayStatus.DISPLAY, ETermDisplayStatus.HIDDEN],
  })
  @IsEnum([ETermDisplayStatus.DISPLAY, ETermDisplayStatus.HIDDEN])
  displayStatus: ETermDisplayStatus = ETermDisplayStatus.DISPLAY;
}
