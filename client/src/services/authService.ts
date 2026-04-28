import { httpClient } from './httpClient';

export interface RegisterPayload {
  accountName: string;
  username: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  account: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: string;
    nome: string;
    username: string;
    email: string;
    role: 'admin';
  };
}

export const authService = {
  register: (payload: RegisterPayload) =>
    httpClient.post<RegisterResponse, RegisterPayload>('/auth/register', payload),
};
