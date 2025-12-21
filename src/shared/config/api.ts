// Базовый URL API без /api/v1
// Если VITE_API_URL содержит /api/v1, он будет удален
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const normalizedUrl = rawUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
export const API_BASE_URL: string = normalizedUrl;

