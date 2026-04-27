const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

export const httpClient = {
  useMocks: USE_MOCKS,
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`Request failed for ${endpoint}`);
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  },
};
