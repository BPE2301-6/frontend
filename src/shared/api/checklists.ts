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
    httpRequest<Checklist[]>(`/tasks/${taskId}/checklists`),
  create: (taskId: string): Promise<Checklist> =>
    httpRequest<Checklist>(`/tasks/${taskId}/checklists`, {
      method: 'POST',
    }),
  delete: (checklistId: string): Promise<null> =>
    httpRequest<null>(`/checklists/${checklistId}`, { method: 'DELETE' }),
  getItems: (checklistId: string): Promise<ChecklistItem[]> =>
    httpRequest<ChecklistItem[]>(`/checklists/${checklistId}/items`),
  createItem: (checklistId: string, payload: ChecklistItemCreatePayload): Promise<ChecklistItem> =>
    httpRequest<ChecklistItem>(`/checklists/${checklistId}/items`, {
      method: 'POST',
      body: payload,
    }),
  updateItem: (itemId: string, payload: ChecklistItemUpdatePayload): Promise<ChecklistItem> =>
    httpRequest<ChecklistItem>(`/checklist-items/${itemId}`, {
      method: 'PATCH',
      body: payload,
    }),
  deleteItem: (itemId: string): Promise<null> =>
    httpRequest<null>(`/checklist-items/${itemId}`, { method: 'DELETE' }),
};

