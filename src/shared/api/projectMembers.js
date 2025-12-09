import { httpRequest } from './httpClient';

export const projectMembersApi = {
  list: (projectId) => httpRequest(`/projects/${projectId}/members`),
  updateRole: (projectId, userId, payload) =>
    httpRequest(`/projects/${projectId}/members/${userId}`, { method: 'PATCH', body: payload }),
};


