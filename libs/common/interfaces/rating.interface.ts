export interface ICreateRatingComment {
  id: string;
  parentId: string;
  content: string;
}

export interface IRatingUser {
  id?: string;
  babysitterId: string;
  point: number;
  comment?: IRatingComment;
  reviewIds: string[];
  bookingId: string
}

export interface IRatingComment {
  content: string;
  images?: IRatingCommentImage[];
}

export interface IRatingCommentImage {
  key: string;
  url: string;
}
