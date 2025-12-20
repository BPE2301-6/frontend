import { httpRequest } from './httpClient';

export interface Checklist {
  id: string;
  task_id: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  content: string;
  is_done: boolean;
  position: number;
  created_at: string;
}

export interface ChecklistItemCreatePayload {
  content: string;
  position?: number;
}

export type ChecklistItemUpdatePayload = Partial<{
  content: string;
  is_done: boolean;
  position: number;
}>;

export const checklistsApi = {
  list: (taskId: string): Promise<Checklist[]> =>
    httpRequest<Checklist[]>(`/api/v1/tasks/${taskId}/checklists`),
  create: (taskId: string): Promise<Checklist> =>
    httpRequest<Checklist>(`/api/v1/tasks/${taskId}/checklists`, {
      method: 'POST',
    }),
  delete: (checklistId: string): Promise<null> =>
    httpRequest<null>(`/api/v1/checklists/${checklistId}`, { method: 'DELETE' }),
  getItems: (checklistId: string): Promise<ChecklistItem[]> =>
    httpRequest<ChecklistItem[]>(`/api/v1/checklists/${checklistId}/items`),
  createItem: (checklistId: string, payload: ChecklistItemCreatePayload): Promise<ChecklistItem> =>
    httpRequest<ChecklistItem>(`/api/v1/checklists/${checklistId}/items`, {
      method: 'POST',
      body: payload,
    }),
  updateItem: (itemId: string, payload: ChecklistItemUpdatePayload): Promise<ChecklistItem> =>
    httpRequest<ChecklistItem>(`/api/v1/checklist-items/${itemId}`, {
      method: 'PATCH',
      body: payload,
    }),
  deleteItem: (itemId: string): Promise<null> =>
    httpRequest<null>(`/api/v1/checklist-items/${itemId}`, { method: 'DELETE' }),
};

