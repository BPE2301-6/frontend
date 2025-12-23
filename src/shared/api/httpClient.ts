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
  
  // Используем относительный URL если base это localhost или абсолютный URL
  let fullUrl: string;
  try {
    const url = new URL(normalizedPath, base);
    fullUrl = url.toString();
  } catch (error) {
    // Если не удалось создать URL (например, относительный путь), используем конкатенацию
    fullUrl = `${base}${normalizedPath}`;
  }

  if (query) {
    const urlObj = new URL(fullUrl);
    Object.entries(query)
      .filter(([, value]) => !isEmptyValue(value))
      .forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => urlObj.searchParams.append(key, String(v)));
        } else {
          urlObj.searchParams.set(key, String(value));
        }
      });
    fullUrl = urlObj.toString();
  }
  
  console.log('API Request URL:', fullUrl);
  return fullUrl;
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

  const url = buildUrl(path, query);
  console.log('API Request:', { method, url, headers, body: body ? JSON.stringify(body) : undefined });
  
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    // Обработка сетевых ошибок (CORS, нет подключения и т.д.)
    console.error('Network error:', error);
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      throw new ApiError(
        'Ошибка сети. Проверьте подключение к серверу и убедитесь, что бэкенд запущен на ' + API_BASE_URL,
        0,
        { message: 'Network error', originalError: error.message, url }
      );
    }
    throw error;
  }

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    
    // Если статус 500, это ошибка на бэкенде
    let errorMessage = payload?.message || `API error: ${response.status}`;
    if (response.status === 500) {
      errorMessage = payload?.message || 'Ошибка на сервере (500). Проверьте логи бэкенда или обратитесь к администратору.';
    } else if (response.status === 404) {
      errorMessage = payload?.message || 'Ресурс не найден (404).';
    } else if (response.status === 401) {
      errorMessage = payload?.message || 'Не авторизован (401). Войдите в систему.';
    } else if (response.status === 403) {
      errorMessage = payload?.message || 'Доступ запрещен (403).';
    }
    
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      url,
      payload,
    });
    
    throw new ApiError(
      errorMessage,
      response.status,
      payload,
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

