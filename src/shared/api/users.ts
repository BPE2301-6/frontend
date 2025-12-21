import { httpRequest } from './httpClient';
import { User, PaginatedUsers } from './types';

export interface UsersQueryParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export const usersApi = {
  list: (query: UsersQueryParams = {}): Promise<PaginatedUsers> =>
    httpRequest<PaginatedUsers>('/users', { query }),
  getById: (userId: string): Promise<User> =>
    httpRequest<User>(`/users/${userId}`),
};

