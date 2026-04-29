import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { setSessionPersistence, supabase } from '@/lib/supabase';

interface AuthProfile {
  id: string;
  nome: string;
  username: string;
  role: string;
  accountId: string;
}

interface AuthAccount {
  id: string;
  name: string;
  slug: string;
}

interface SignInParams {
  email: string;
  password: string;
  rememberSession: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  account: AuthAccount | null;
  isLoading: boolean;
  signIn: (params: SignInParams) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const loadUserContext = async (user: User) => {
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, nome, username, role, account_id')
    .eq('id', user.id)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('id, name, slug')
    .eq('id', profile.account_id)
    .single();

  if (accountError) {
    throw new Error(accountError.message);
  }

  return {
    profile: {
      id: profile.id,
      nome: profile.nome,
      username: profile.username,
      role: profile.role,
      accountId: profile.account_id,
    },
    account,
  };
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [account, setAccount] = useState<AuthAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncUserState = async (nextSession: Session | null) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setAccount(null);
        setIsLoading(false);
        return;
      }

      try {
        const context = await loadUserContext(nextUser);

        if (!isMounted) {
          return;
        }

        setProfile(context.profile);
        setAccount(context.account);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(error);
        setProfile(null);
        setAccount(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error(error);
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      syncUserState(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      syncUserState(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      account,
      isLoading,
      signIn: async ({ email, password, rememberSession }) => {
        setSessionPersistence(rememberSession);

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw new Error(error.message);
        }
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut({ scope: 'local' });

        if (error) {
          throw new Error(error.message);
        }
      },
    }),
    [account, isLoading, profile, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
};
