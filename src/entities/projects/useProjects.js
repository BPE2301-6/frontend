import { useEffect, useState } from 'react';
import { projectsApi } from '@shared/api/projects';
import { ApiError } from '@shared/api/httpClient';

export function useProjects(initialFilters = {}) {
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectsApi.list(filters);
      setProjects(res?.items || res || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (payload) => {
    setError(null);
    try {
      await projectsApi.create(payload);
      await load();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const updateProject = async (projectId, payload) => {
    setError(null);
    try {
      await projectsApi.update(projectId, payload);
      await load();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return {
    projects,
    loading,
    error,
    filters,
    setFilters,
    reload: load,
    createProject,
    updateProject,
    isApiError: (err) => err instanceof ApiError,
  };
}


