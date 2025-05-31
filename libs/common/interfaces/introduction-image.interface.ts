export interface IIntroductionImageBase {
  id: string;
  order: number;
  url: string;
}

export interface ICreateIntroductionImage extends IIntroductionImageBase {
  key: string;
}

export interface ISaveIntroductionImage extends IIntroductionImageBase {}

