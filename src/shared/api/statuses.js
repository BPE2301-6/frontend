import { httpRequest } from './httpClient';

export const fetchStatuses = (projectId) =>
  httpRequest(`/projects/${projectId}/statuses`);

export const createStatus = (projectId, payload) =>
  httpRequest(`/projects/${projectId}/statuses`, { method: 'POST', body: payload });

export const updateStatus = (statusId, payload) =>
  httpRequest(`/statuses/${statusId}`, { method: 'PATCH', body: payload });

export const deleteStatus = (statusId) =>
  httpRequest(`/statuses/${statusId}`, { method: 'DELETE' });

