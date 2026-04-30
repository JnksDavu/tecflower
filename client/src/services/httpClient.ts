import { supabase } from '@/lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
type QueryValue = string | number | boolean | undefined;
type QueryParams = Record<string, QueryValue>;

const buildUrl = (endpoint: string, query?: QueryParams) => {
  const url = new URL(`${API_URL}${endpoint}`);

  if (!query) {
    return url.toString();
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

const getHeaders = async (headers?: HeadersInit): Promise<HeadersInit> => {
  const nextHeaders = new Headers(headers);
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (accessToken) {
    nextHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  return nextHeaders;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json().catch(() => null)) as
    | { data?: T; message?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload?.data as T;
};

export const httpClient = {
  useMocks: USE_MOCKS,
  get: async <T>(endpoint: string, query?: QueryParams): Promise<T> => {
    const response = await fetch(buildUrl(endpoint, query), {
      headers: await getHeaders(),
    });

    return parseResponse<T>(response);
  },
  post: async <TResponse, TBody = unknown>(endpoint: string, body: TBody): Promise<TResponse> => {
    const response = await fetch(buildUrl(endpoint), {
      method: 'POST',
      headers: await getHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(body),
    });

    return parseResponse<TResponse>(response);
  },
  patch: async <TResponse, TBody = unknown>(endpoint: string, body: TBody): Promise<TResponse> => {
    const response = await fetch(buildUrl(endpoint), {
      method: 'PATCH',
      headers: await getHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(body),
    });

    return parseResponse<TResponse>(response);
  },
};
