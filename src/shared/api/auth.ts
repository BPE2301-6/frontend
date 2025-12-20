import { httpRequest } from './httpClient';

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegisterResponse {
  user: User;
}

export interface LoginResponse {
  access_token: string;
  expires_in: number;
}

export const authApi = {
  register: (payload: RegisterPayload): Promise<RegisterResponse> =>
    httpRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    }),
  login: (payload: LoginPayload): Promise<LoginResponse> =>
    httpRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    }),
};

