export interface IUserTerm {
  userId: string;
  termId: string;
  isAgreed: boolean;
}

export interface IUpdateUserTerms extends IUserTerm {
  id?: string;
}
