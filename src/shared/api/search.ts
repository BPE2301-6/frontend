import { httpRequest } from './httpClient';

export interface Tag {
  id: string;
  name: string;
}

export interface Comment {
  id: string;
  task_id: string;
  body: string;
}

export interface SearchResult {
  tasks: Array<{
    id: string;
    key: string;
    title: string;
  }>;
  tags: Tag[];
  comments: Comment[];
}

export interface SearchQueryParams {
  q: string;
  project_id?: string;
  scope?: string; // 'tasks,tags,comments' или отдельные значения
  [key: string]: string | number | boolean | string[] | undefined | null;
}

export const searchApi = {
  search: (params: SearchQueryParams): Promise<SearchResult> =>
    httpRequest<SearchResult>('/api/v1/search', { query: params }),
};

