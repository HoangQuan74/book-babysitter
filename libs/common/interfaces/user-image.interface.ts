export interface IUserImage {
  url: string;
  key: string;
  order?: number;
}

export interface IUpdateUserImage extends Omit<IUserImage, 'key'> {
  key?: string;
  id?: string;
}
