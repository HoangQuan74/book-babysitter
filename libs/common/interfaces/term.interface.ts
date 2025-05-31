import { IQuery } from '.';
import { ESearchTerm, ETermDisplayStatus } from '../enums';

interface IBaseTerm {
  title?: string;
  content?: string;
  isRequired?: boolean;
  languageId?: string;
  termTypeId?: string;
  displayStatus?: ETermDisplayStatus;
}

export interface ICreateTerm extends IBaseTerm {
  order?: number;
}

export interface IUpdateTerm extends IBaseTerm {}

interface IBaseTermQuery {
  termTypeId?: string;
  displayStatus?: ETermDisplayStatus;
}

export interface IAdminTermQuery extends IBaseTermQuery, IQuery {
  status?: string;
  typeSearch?: ESearchTerm;
}

export interface IUserTermQuery extends IBaseTermQuery {
  languageId?: string;
}
