import { useEffect, useState } from 'react';
import {
  projectsApi,
  ProjectsQueryParams,
} from '@shared/api/projects';
import { ApiError } from '@shared/api/httpClient';
import {
  Project,
  ProjectCreatePayload,
  ProjectUpdatePayload,
} from '@shared/api/types';

export function useProjects(initialFilters: ProjectsQueryParams = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<ProjectsQueryParams>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    limit: number;
    offset: number;
  }>({ total: 0, limit: 20, offset: 0 });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectsApi.list(filters);
      setProjects(res?.items || []);
      setPagination({
        total: res?.total || 0,
        limit: res?.limit || 20,
        offset: res?.offset || 0,
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (payload: ProjectCreatePayload): Promise<Project> => {
    setError(null);
    try {
      const createdProject = await projectsApi.create(payload);
      await load();
      return createdProject;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateProject = async (
    projectId: string,
    payload: ProjectUpdatePayload
  ) => {
    setError(null);
    try {
      await projectsApi.update(projectId, payload);
      await load();
    } catch (err) {
      setError(err as Error);
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
    pagination,
    isApiError: (err: unknown): err is ApiError => err instanceof ApiError,
  };
}

