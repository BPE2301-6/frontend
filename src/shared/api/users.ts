import { httpRequest } from './httpClient';
import { User, PaginatedUsers } from './types';

export interface UsersQueryParams {
  search?: string;
  limit?: number;
  offset?: number;
  [key: string]: string | number | boolean | string[] | undefined | null;
}

export const usersApi = {
  list: (query: UsersQueryParams = {}): Promise<PaginatedUsers> =>
    httpRequest<PaginatedUsers>('/api/v1/users', { query }),
  getById: (userId: string): Promise<User> =>
    httpRequest<User>(`/api/v1/users/${userId}`),
};

