import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

let supabaseAdminClient;

export const getSupabaseAdminClient = () => {
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    const error = new Error(
      'Supabase is not configured. Define SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env.',
    );
    error.status = 500;
    throw error;
  }

  supabaseAdminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminClient;
};
