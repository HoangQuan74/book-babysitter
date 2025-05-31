import { IBasicLocalization } from '.';

export interface ICountry {
  id?: string;
  name: IBasicLocalization;
  cities: ICity[];
}

export interface ICity {
  id?: string;
  name: IBasicLocalization;
}
