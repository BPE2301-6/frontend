// Deprecated: use httpRequest from './httpClient'
import { httpRequest, ApiError, HttpRequestOptions } from './httpClient';

export const apiClient = {
  get: <T = unknown>(path: string, options?: Omit<HttpRequestOptions, 'method'>) =>
    httpRequest<T>(path, { ...options, method: 'GET' }),
  post: <T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<HttpRequestOptions, 'method' | 'body'>
  ) => httpRequest<T>(path, { ...options, method: 'POST', body }),
  patch: <T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<HttpRequestOptions, 'method' | 'body'>
  ) => httpRequest<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T = unknown>(path: string, options?: Omit<HttpRequestOptions, 'method'>) =>
    httpRequest<T>(path, { ...options, method: 'DELETE' }),
};

export { ApiError };

