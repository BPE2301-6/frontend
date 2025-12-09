import { useEffect, useState } from 'react';
import { usersApi } from '@shared/api/users';
import { ApiError } from '@shared/api/httpClient';

export function useUsers(initialFilters = {}) {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.list(filters);
      setUsers(res?.items || res || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return {
    users,
    loading,
    error,
    filters,
    setFilters,
    reload: load,
    isApiError: (err) => err instanceof ApiError,
  };
}


