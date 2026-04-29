import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase não configurado no client. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
}

const AUTH_PERSISTENCE_KEY = 'tecflower-auth-persistence';

type AuthPersistence = 'local' | 'session';

const isBrowser = typeof window !== 'undefined';

const readPersistence = (): AuthPersistence => {
  if (!isBrowser) {
    return 'local';
  }

  const sessionPreference = window.sessionStorage.getItem(AUTH_PERSISTENCE_KEY);
  if (sessionPreference === 'session') {
    return 'session';
  }

  const localPreference = window.localStorage.getItem(AUTH_PERSISTENCE_KEY);
  if (localPreference === 'local') {
    return 'local';
  }

  return 'local';
};

let persistence: AuthPersistence = readPersistence();

const getStorageByPersistence = (mode: AuthPersistence) =>
  mode === 'session' ? window.sessionStorage : window.localStorage;

const getActiveStorage = () => getStorageByPersistence(persistence);
const getInactiveStorage = () => getStorageByPersistence(persistence === 'local' ? 'session' : 'local');

export const setSessionPersistence = (rememberSession: boolean) => {
  if (!isBrowser) {
    return;
  }

  persistence = rememberSession ? 'local' : 'session';
  getActiveStorage().setItem(AUTH_PERSISTENCE_KEY, persistence);
  getInactiveStorage().removeItem(AUTH_PERSISTENCE_KEY);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: {
      getItem: (key) => {
        if (!isBrowser) {
          return null;
        }

        return getActiveStorage().getItem(key) ?? getInactiveStorage().getItem(key);
      },
      setItem: (key, value) => {
        if (!isBrowser) {
          return;
        }

        getActiveStorage().setItem(key, value);
        getInactiveStorage().removeItem(key);
      },
      removeItem: (key) => {
        if (!isBrowser) {
          return;
        }

        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
      },
    },
  },
});
