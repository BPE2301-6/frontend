import { httpRequest } from './httpClient';
import {
  Project,
  ProjectCreatePayload,
  ProjectUpdatePayload,
  PaginatedProjects,
} from './types';

export interface ProjectsQueryParams {
  search?: string;
  limit?: number;
  offset?: number;
  [key: string]: string | number | boolean | string[] | undefined | null;
}

export const projectsApi = {
  create: (payload: ProjectCreatePayload): Promise<Project> =>
    httpRequest<Project>('/api/v1/projects', { method: 'POST', body: payload }),
  list: (query: ProjectsQueryParams = {}): Promise<PaginatedProjects> =>
    httpRequest<PaginatedProjects>('/api/v1/projects', { query: query as Record<string, string | number | boolean | string[] | undefined | null> }),
  getById: (projectId: string): Promise<Project> =>
    httpRequest<Project>(`/api/v1/projects/${projectId}`),
  update: (projectId: string, payload: ProjectUpdatePayload): Promise<Project> =>
    httpRequest<Project>(`/api/v1/projects/${projectId}`, {
      method: 'PATCH',
      body: payload,
    }),
  delete: (projectId: string): Promise<null> =>
    httpRequest<null>(`/api/v1/projects/${projectId}`, { method: 'DELETE' }),
};

