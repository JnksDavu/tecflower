import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

const normalizeSupabaseUrl = (value) =>
  value
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/rest\/v1$/i, '');

export const env = {
  port: process.env.PORT || 3001,
  supabaseUrl: process.env.SUPABASE_URL ? normalizeSupabaseUrl(process.env.SUPABASE_URL) : '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};
