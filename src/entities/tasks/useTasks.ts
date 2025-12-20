import { useEffect, useState } from 'react';
import {
  fetchTasks,
  createTask as createTaskApi,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
  moveTask as moveTaskApi,
  TasksQueryParams,
} from '@shared/api/tasks';
import { ApiError } from '@shared/api/httpClient';
import {
  Task,
  TaskCreatePayload,
  TaskUpdatePayload,
} from '@shared/api/types';

export function useTasks(
  projectId: string | null,
  initialFilters: TasksQueryParams = {}
) {
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<TasksQueryParams>(initialFilters);

  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTasks(projectId, { ...filters, limit: 200 });
      setData(res?.items || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (payload: TaskCreatePayload) => {
    if (!projectId) return;
    setError(null);
    try {
      await createTaskApi(projectId, payload);
      await load();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateTask = async (taskId: string, payload: TaskUpdatePayload) => {
    setError(null);
    try {
      await updateTaskApi(taskId, payload);
      await load();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const moveTask = async (taskId: string, statusId: string) => {
    setError(null);
    try {
      await moveTaskApi(taskId, statusId);
      await load();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    setError(null);
    try {
      await deleteTaskApi(taskId);
      await load();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, filters]);

  return {
    tasks: data,
    loading,
    error,
    filters,
    setFilters,
    reload: load,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    isApiError: (err: unknown): err is ApiError => err instanceof ApiError,
  };
}

