export interface PostSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: PostSearchBody;
    }>;
  };
}
export interface PostSearchBody {
  id: number;
  title: string;
  content: string;
  authorId: number;
}
