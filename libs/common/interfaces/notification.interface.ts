import { ENotificationBackgroundType } from '@lib/core/databases/postgres/entities/notification-background.entity';
import { IExtendedLocalizationEN } from '.';

export interface INotificationBackground {
  type: ENotificationBackgroundType;
  title: string;
  content: IExtendedLocalizationEN;
  isDisable: boolean;
}
