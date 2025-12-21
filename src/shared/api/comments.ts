import { httpRequest } from './httpClient';

export interface Comment {
  id: string;
  task_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface CommentCreatePayload {
  body: string;
}

export interface PaginatedComments {
  items: Comment[];
  total: number;
  limit: number;
  offset: number;
}

export const commentsApi = {
  list: (taskId: string, query: { limit?: number; offset?: number } = {}): Promise<PaginatedComments> =>
    httpRequest<PaginatedComments>(`/tasks/${taskId}/comments`, { query }),
  create: (taskId: string, payload: CommentCreatePayload): Promise<Comment> =>
    httpRequest<Comment>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: payload,
    }),
  delete: (commentId: string): Promise<null> =>
    httpRequest<null>(`/comments/${commentId}`, { method: 'DELETE' }),
};

