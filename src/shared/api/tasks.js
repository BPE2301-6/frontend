import { httpRequest } from './httpClient';

export const fetchTasks = (projectId, filters = {}) =>
  httpRequest(`/projects/${projectId}/tasks`, { query: filters });

export const fetchTaskById = (taskId) => httpRequest(`/tasks/${taskId}`);

export const createTask = (projectId, payload) =>
  httpRequest(`/projects/${projectId}/tasks`, { method: 'POST', body: payload });

export const updateTask = (taskId, payload) =>
  httpRequest(`/tasks/${taskId}`, { method: 'PATCH', body: payload });

export const moveTask = (taskId, statusId) =>
  httpRequest(`/tasks/${taskId}/move`, { method: 'POST', body: { status_id: statusId } });

export const deleteTask = (taskId) =>
  httpRequest(`/tasks/${taskId}`, { method: 'DELETE' });

