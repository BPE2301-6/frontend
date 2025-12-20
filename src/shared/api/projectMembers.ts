import { httpRequest } from './httpClient';
import { ProjectMember, ProjectRole } from './types';

export interface UpdateRolePayload {
  role: ProjectRole;
}

export const projectMembersApi = {
  list: (projectId: string): Promise<ProjectMember[]> =>
    httpRequest<ProjectMember[]>(`/api/v1/projects/${projectId}/members`),
  add: (
    projectId: string,
    payload: { user_id: string; role: ProjectRole }
  ): Promise<ProjectMember> =>
    httpRequest<ProjectMember>(`/api/v1/projects/${projectId}/members`, {
      method: 'POST',
      body: payload,
    }),
  updateRole: (
    projectId: string,
    userId: string,
    payload: UpdateRolePayload
  ): Promise<ProjectMember> =>
    httpRequest<ProjectMember>(
      `/api/v1/projects/${projectId}/members/${userId}`,
      { method: 'PATCH', body: payload }
    ),
  delete: (projectId: string, userId: string): Promise<null> =>
    httpRequest<null>(`/api/v1/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    }),
};

