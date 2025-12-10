import { httpRequest } from './httpClient';

export const projectsApi = {
  create: (payload) => httpRequest('/projects', { method: 'POST', body: payload }),
  list: (query = {}) => httpRequest('/projects', { query }),
  getById: (projectId) => httpRequest(`/projects/${projectId}`),
  update: (projectId, payload) =>
    httpRequest(`/projects/${projectId}`, { method: 'PATCH', body: payload }),
};


