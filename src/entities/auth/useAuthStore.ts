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
          set({
            token: response.access_token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          return response;
        } catch (error) {
          const errorMessage =
            error instanceof ApiError ? error.message : 'Ошибка входа';
          set({
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
          set({
            user: response.user,
            loading: false,
            error: null,
          });
          return response;
        } catch (error) {
          const errorMessage =
            error instanceof ApiError ? error.message : 'Ошибка регистрации';
          set({
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

