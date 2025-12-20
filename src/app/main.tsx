import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import '@shared/styles/globals.css';
import { useAuthStore } from '@entities/auth/useAuthStore';
import { setTokenGetter } from '@shared/api/httpClient';

// Настройка получения токена для httpClient
setTokenGetter(() => useAuthStore.getState().token);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

