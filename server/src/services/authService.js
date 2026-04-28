import { getSupabaseAdminClient } from '../lib/supabase.js';

const slugify = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

const createHttpError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const registerAccountOwner = async ({
  accountName,
  username,
  email,
  password,
}) => {
  if (!accountName || !username || !email || !password) {
    throw createHttpError('Preencha nome da conta, usuario, email e senha.', 400);
  }

  if (password.length < 6) {
    throw createHttpError('A senha deve ter pelo menos 6 caracteres.', 400);
  }

  const supabase = getSupabaseAdminClient();
  const nome = username;
  const slug = slugify(accountName);

  if (!slug) {
    throw createHttpError('Informe um nome de conta valido.', 400);
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nome,
      username,
    },
  });

  if (authError) {
    throw createHttpError(authError.message, 400);
  }

  const authUserId = authData.user?.id;

  if (!authUserId) {
    throw createHttpError('Nao foi possivel criar o usuario no Supabase Auth.', 500);
  }

  try {
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert({
        name: accountName,
        slug,
      })
      .select('id, name, slug')
      .single();

    if (accountError) {
      throw createHttpError(accountError.message, 400);
    }

    const { error: userError } = await supabase.from('users').insert({
      id: authUserId,
      account_id: account.id,
      nome,
      username,
      role: 'admin',
    });

    if (userError) {
      throw createHttpError(userError.message, 400);
    }

    return {
      account,
      user: {
        id: authUserId,
        nome,
        username,
        email,
        role: 'admin',
      },
    };
  } catch (error) {
    await supabase.auth.admin.deleteUser(authUserId);
    throw error;
  }
};
