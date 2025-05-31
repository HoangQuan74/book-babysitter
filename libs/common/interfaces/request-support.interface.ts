import { IQuery } from '.';
import { ERequestStatus, ERequestType } from '../enums';

export interface IRequestQuery extends IQuery {
  type?: ERequestType;
  status?: ERequestStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface IUpdateRequest {
  id: string;
  status: ERequestStatus;
}

export interface IRequestReport {
  reason?: string;
  accusedId?: string;
  answer?: string;
  answerId?: string;
  id?: string;
}

export interface IRequestQuestion {
  id?: string;
  content?: string;
}
