import { httpRequest } from './httpClient';
import {
  Task,
  TaskCreatePayload,
  TaskUpdatePayload,
  PaginatedTasks,
} from './types';

export interface TasksQueryParams {
  status_id?: string;
  assignee_id?: string;
  reporter_id?: string;
  priority?: string;
  tag_id?: string;
  q?: string;
  due_from?: string;
  due_to?: string;
  limit?: number;
  offset?: number;
  sort?: string;
}

export const fetchTasks = (
  projectId: string,
  filters: TasksQueryParams = {}
): Promise<PaginatedTasks> =>
  httpRequest<PaginatedTasks>(`/projects/${projectId}/tasks`, {
    query: filters,
  });

export const fetchTaskById = (taskId: string): Promise<Task> =>
  httpRequest<Task>(`/tasks/${taskId}`);

export const createTask = (
  projectId: string,
  payload: TaskCreatePayload
): Promise<Task> =>
  httpRequest<Task>(`/projects/${projectId}/tasks`, {
    method: 'POST',
    body: payload,
  });

export const updateTask = (
  taskId: string,
  payload: TaskUpdatePayload
): Promise<Task> =>
  httpRequest<Task>(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: payload,
  });

export const moveTask = (taskId: string, statusId: string): Promise<Task> =>
  httpRequest<Task>(`/tasks/${taskId}/move`, {
    method: 'POST',
    body: { status_id: statusId },
  });

export const deleteTask = (taskId: string): Promise<null> =>
  httpRequest<null>(`/tasks/${taskId}`, { method: 'DELETE' });

