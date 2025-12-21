import { httpRequest } from './httpClient';

export interface Tag {
  id: string;
  project_id: string;
  name: string;
  color: string | null;
}

export interface TagCreatePayload {
  name: string;
  color?: string | null;
}

export type TagUpdatePayload = Partial<TagCreatePayload>;

export interface PaginatedTags {
  items: Tag[];
  total: number;
  limit: number;
  offset: number;
}

export const tagsApi = {
  list: (projectId: string): Promise<PaginatedTags> =>
    httpRequest<PaginatedTags>(`/projects/${projectId}/tags`),
  create: (projectId: string, payload: TagCreatePayload): Promise<Tag> =>
    httpRequest<Tag>(`/projects/${projectId}/tags`, {
      method: 'POST',
      body: payload,
    }),
  update: (tagId: string, payload: TagUpdatePayload): Promise<Tag> =>
    httpRequest<Tag>(`/tags/${tagId}`, {
      method: 'PATCH',
      body: payload,
    }),
  delete: (tagId: string): Promise<null> =>
    httpRequest<null>(`/tags/${tagId}`, { method: 'DELETE' }),
  attachToTask: (taskId: string, tagIds: string[]): Promise<{ tag_ids: string[] }> =>
    httpRequest<{ tag_ids: string[] }>(`/tasks/${taskId}/tags`, {
      method: 'POST',
      body: { tag_ids: tagIds },
    }),
  detachFromTask: (taskId: string, tagId: string): Promise<null> =>
    httpRequest<null>(`/tasks/${taskId}/tags/${tagId}`, { method: 'DELETE' }),
};

