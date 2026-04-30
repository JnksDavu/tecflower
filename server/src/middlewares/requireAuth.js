import { getSupabaseAdminClient } from '../lib/supabase.js';
import { createHttpError } from '../utils/httpError.js';

export const requireAuth = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization || '';

    if (!authorization.startsWith('Bearer ')) {
      throw createHttpError('Sessão inválida. Faça login novamente.', 401);
    }

    const token = authorization.slice('Bearer '.length).trim();

    if (!token) {
      throw createHttpError('Sessão inválida. Faça login novamente.', 401);
    }

    const supabase = getSupabaseAdminClient();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      throw createHttpError('Sessão inválida. Faça login novamente.', 401);
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, account_id, role, nome, username')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      throw createHttpError('Perfil do usuário não encontrado.', 403);
    }

    req.auth = {
      userId: profile.id,
      accountId: profile.account_id,
      role: profile.role,
      nome: profile.nome,
      username: profile.username,
    };

    next();
  } catch (error) {
    next(error);
  }
};
