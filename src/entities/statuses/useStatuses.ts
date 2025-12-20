import { useEffect, useState } from 'react';
import {
  fetchStatuses,
  createStatus as createStatusApi,
  deleteStatus as deleteStatusApi,
} from '@shared/api/statuses';
import { ApiError } from '@shared/api/httpClient';
import { Status, StatusCreatePayload } from '@shared/api/types';

export function useStatuses(projectId: string | null) {
  const [data, setData] = useState<Status[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStatuses(projectId);
      setData(res || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createStatus = async (payload: StatusCreatePayload) => {
    if (!projectId) return;
    setError(null);
    try {
      await createStatusApi(projectId, payload);
      await load();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteStatus = async (statusId: string) => {
    setError(null);
    try {
      await deleteStatusApi(statusId);
      await load();
    } catch (err) {
      setError(err as Error);
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
    isApiError: (err: unknown): err is ApiError => err instanceof ApiError,
  };
}

