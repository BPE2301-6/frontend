// Deprecated: use httpRequest from './httpClient'
import { httpRequest, ApiError } from './httpClient';

export const apiClient = {
  get: (path, options) => httpRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options) => httpRequest(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => httpRequest(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => httpRequest(path, { ...options, method: 'DELETE' }),
};

export { ApiError };

