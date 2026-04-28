const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

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
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`);
    return parseResponse<T>(response);
  },
  post: async <TResponse, TBody = unknown>(endpoint: string, body: TBody): Promise<TResponse> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return parseResponse<TResponse>(response);
  },
};
