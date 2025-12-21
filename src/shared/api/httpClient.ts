import { API_BASE_URL } from '../config/api';

export interface ApiErrorPayload {
  message?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload | null;

  constructor(message: string, status: number, payload: ApiErrorPayload | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const isEmptyValue = (value: unknown): boolean =>
  value === undefined || value === null || value === '';

// Функция для получения токена (будет установлена извне)
let getToken: () => string | null = () => null;

export const setTokenGetter = (fn: () => string | null): void => {
  getToken = fn;
};

interface QueryParams {
  [key: string]: string | number | boolean | string[] | undefined | null;
}

const buildUrl = (path: string, query?: QueryParams): string => {
  // Путь должен быть полным (уже содержать /api/v1)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const url = new URL(normalizedPath, base);

  if (query) {
    Object.entries(query)
      .filter(([, value]) => !isEmptyValue(value))
      .forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.set(key, String(value));
        }
      });
  }
  return url.toString();
};

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: unknown;
  query?: QueryParams;
  signal?: AbortSignal;
}

export async function httpRequest<T = unknown>(
  path: string,
  { method = 'GET', body, query, signal }: HttpRequestOptions = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    signal,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;
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
    return null as T;
  }

  return response.json() as Promise<T>;
}

