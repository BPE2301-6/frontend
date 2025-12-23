import { useEffect, useState } from 'react';
import { projectMembersApi } from '@shared/api/projectMembers';
import { ProjectMember } from '@shared/api/types';
import { ApiError } from '@shared/api/httpClient';
import { usersApi } from '@shared/api/users';
import { User } from '@shared/api/types';

export function useProjectMembers(projectId: string | null) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const membersList = await projectMembersApi.list(projectId);
      setMembers(membersList);
      
      // Получаем информацию о пользователях для каждого участника
      const userIds = membersList.map(m => m.user_id);
      const usersPromises = userIds.map(userId => usersApi.getById(userId));
      const usersData = await Promise.all(usersPromises);
      setUsers(usersData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return {
    members,
    users,
    loading,
    error,
    reload: load,
    isApiError: (err: unknown): err is ApiError => err instanceof ApiError,
  };
}

