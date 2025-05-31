import { ETypePoint } from '../enums';

export interface IAddPoint {
  babysitterId: string;
  type: ETypePoint;
  rating?: number; // only for rating
}
