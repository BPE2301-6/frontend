// Приоритеты
export const PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

export type Priority = typeof PRIORITY[keyof typeof PRIORITY];

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Status {
  id: string;
  project_id: string;
  name: string;
  position: number;
  is_closed: boolean;
  created_at: string;
}

export interface StatusCreatePayload {
  name: string;
  position: number;
  is_closed: boolean;
}

export type StatusUpdatePayload = Partial<StatusCreatePayload>;

export interface Task {
  id: string;
  project_id: string;
  seq: number;
  key: string;
  title: string;
  description: string | null;
  status_id: string;
  priority: Priority;
  reporter_id: string;
  assignee_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  tag_ids?: string[];
  timedelta?: {
    status: 'LOW' | 'MEDIUM' | 'HIGH';
    delta: number; // 0-100
  };
}

export interface TaskCreatePayload {
  title: string;
  description?: string | null;
  status_id: string;
  priority: Priority;
  reporter_id: string;
  assignee_id?: string | null;
  due_date?: string | null;
  tag_ids?: string[];
  timedelta?: {
    status: 'LOW' | 'MEDIUM' | 'HIGH';
    delta: number; // 0-100
  };
}

export type TaskUpdatePayload = Partial<TaskCreatePayload>;

export interface PaginatedTasks {
  items: Task[];
  total: number;
  limit: number;
  offset: number;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string | null;
  lead_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreatePayload {
  key: string;
  name: string;
  description?: string | null;
  lead_id: string;
}

export type ProjectUpdatePayload = Partial<ProjectCreatePayload>;

export interface PaginatedProjects {
  items: Project[];
  total: number;
  limit: number;
  offset: number;
}

export type ProjectRole = 'OWNER' | 'MEMBER';

export interface ProjectMember {
  project_id: string;
  user_id: string;
  role: ProjectRole;
  added_at: string;
}

export interface PaginatedUsers {
  items: User[];
  total: number;
  limit: number;
  offset: number;
}

