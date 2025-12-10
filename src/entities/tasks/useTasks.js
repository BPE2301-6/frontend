import { useEffect, useState } from 'react';
import {
  fetchTasks,
  createTask as createTaskApi,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
  moveTask as moveTaskApi,
} from '@shared/api/tasks';
import { ApiError } from '@shared/api/httpClient';

export function useTasks(projectId, initialFilters = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTasks(projectId, { ...filters, limit: 200 });
      setData(res?.items || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (payload) => {
    if (!projectId) return;
    setError(null);
    try {
      await createTaskApi(projectId, payload);
      await load();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const updateTask = async (taskId, payload) => {
    setError(null);
    try {
      await updateTaskApi(taskId, payload);
      await load();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const moveTask = async (taskId, statusId) => {
    setError(null);
    try {
      await moveTaskApi(taskId, statusId);
      await load();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const deleteTask = async (taskId) => {
    setError(null);
    try {
      await deleteTaskApi(taskId);
      await load();
    } catch (err) {
      setError(err);
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
    isApiError: (err) => err instanceof ApiError,
  };
}


