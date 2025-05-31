import { IQuery } from '.';
import { EFaqDisplayStatus, EFaqType } from '../enums';

export interface IFaqQuery extends IQuery {
  languageId?: string;
  faqType?: EFaqType;
  displayStatus?: EFaqDisplayStatus;
}

export interface ICreateFaq {
  languageId: string;
  faqType: EFaqType;
  displayStatus: EFaqDisplayStatus;
  title: string;
  content: string;
  order: number;
}

export interface IUpdateFaq extends ICreateFaq {
  id: string;
}
