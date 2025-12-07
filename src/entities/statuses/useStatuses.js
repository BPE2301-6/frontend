import { useEffect, useState } from 'react';
import {
  fetchStatuses,
  createStatus as createStatusApi,
  deleteStatus as deleteStatusApi,
} from '@shared/api/statuses';
import { ApiError } from '@shared/api/httpClient';

export function useStatuses(projectId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStatuses(projectId);
      setData(res || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const createStatus = async (payload) => {
    if (!projectId) return;
    setError(null);
    try {
      await createStatusApi(projectId, payload);
      await load();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const deleteStatus = async (statusId) => {
    setError(null);
    try {
      await deleteStatusApi(statusId);
      await load();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return {
    statuses: data,
    loading,
    error,
    reload: load,
    createStatus,
    deleteStatus,
    isApiError: (err) => err instanceof ApiError,
  };
}


