import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, User, LoginResponse, RegisterResponse } from '@shared/api/auth';
import { ApiError } from '@shared/api/httpClient';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (email: string, password: string, name: string) => Promise<RegisterResponse>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          // После успешного логина получаем информацию о пользователе
          try {
            const user = await authApi.getCurrentUser();
            set({
              token: response.access_token,
              user: user,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
          } catch (userError) {
            // Если не удалось получить пользователя, очищаем токен
            set({
              token: null,
              user: null,
              isAuthenticated: false,
              loading: false,
              error: userError instanceof ApiError ? userError.message : 'Не удалось получить информацию о пользователе',
            });
            throw userError;
          }
          return response;
        } catch (error) {
          const errorMessage =
            error instanceof ApiError ? error.message : 'Ошибка входа';
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.register({ email, password, name });
          // После регистрации автоматически логинимся для получения токена
          try {
            const loginResponse = await authApi.login({ email, password });
            const user = await authApi.getCurrentUser();
            set({
              token: loginResponse.access_token,
              user: user,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
          } catch (loginError) {
            // Если не удалось залогиниться после регистрации, очищаем состояние
            set({
              token: null,
              user: null,
              isAuthenticated: false,
              loading: false,
              error: loginError instanceof ApiError ? loginError.message : 'Не удалось войти после регистрации',
            });
            throw loginError;
          }
          return response;
        } catch (error) {
          const errorMessage =
            error instanceof ApiError ? error.message : 'Ошибка регистрации';
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

