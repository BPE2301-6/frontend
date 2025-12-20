import { useEffect, useState } from 'react';
import { usersApi, UsersQueryParams } from '@shared/api/users';
import { ApiError } from '@shared/api/httpClient';
import { User } from '@shared/api/types';

export function useUsers(initialFilters: UsersQueryParams = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<UsersQueryParams>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.list(filters);
      setUsers(res?.items || []);
    } catch (err) {
      setError(err as Error);
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
    isApiError: (err: unknown): err is ApiError => err instanceof ApiError,
  };
}

