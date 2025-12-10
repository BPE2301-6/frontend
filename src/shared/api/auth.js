import { httpRequest } from './httpClient';

export const authApi = {
  register: (payload) =>
    httpRequest('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => httpRequest('/auth/login', { method: 'POST', body: payload }),
};


