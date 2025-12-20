import { httpRequest } from './httpClient';
import {
  Status,
  StatusCreatePayload,
  StatusUpdatePayload,
} from './types';

export const fetchStatuses = (projectId: string): Promise<Status[]> =>
  httpRequest<Status[]>(`/api/v1/projects/${projectId}/statuses`);

export const createStatus = (
  projectId: string,
  payload: StatusCreatePayload
): Promise<Status> =>
  httpRequest<Status>(`/api/v1/projects/${projectId}/statuses`, {
    method: 'POST',
    body: payload,
  });

export const updateStatus = (
  statusId: string,
  payload: StatusUpdatePayload
): Promise<Status> =>
  httpRequest<Status>(`/api/v1/statuses/${statusId}`, {
    method: 'PATCH',
    body: payload,
  });

export const deleteStatus = (statusId: string): Promise<null> =>
  httpRequest<null>(`/api/v1/statuses/${statusId}`, { method: 'DELETE' });

