import { API_BASE_URL } from '../config/api';

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const isEmptyValue = (value) =>
  value === undefined || value === null || value === '';

const buildUrl = (path, query) => {
  const base = API_BASE_URL.endswith('/') ? API_BASE_URL : '${API_BASE_URL}/';
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(normalizedPath, base);

  if (query) {
    Object.entries(query)
      .filter(([, value]) => !isEmptyValue(value))
      .forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => url.searchParams.append(key, v));
        } else {
          url.searchParams.set(key, value);
        }
      });
  }
  return url.toString();
};

export async function httpRequest(path, { method = 'GET', body, query, signal } = {}) {
  const response = await fetch(buildUrl(path, query), {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      // TODO: auth-header when auth is ready
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let payload;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    throw new ApiError(
      payload?.message || `API error: ${response.status}`,
      response.status,
      payload,
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export { ApiError };


