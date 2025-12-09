import { httpRequest } from './httpClient';

export const usersApi = {
  list: (query = {}) => httpRequest('/users', { query }),
  getById: (userId) => httpRequest(`/users/${userId}`),
};


