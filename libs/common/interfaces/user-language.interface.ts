import { ELanguageLevel } from '../enums';

export interface IUserLanguage {
  languageId: string;
  level: ELanguageLevel;
}

export interface IUpdateUserLanguages extends IUserLanguage{
  id?: string;
}
