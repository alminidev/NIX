'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { authClient, useSession } from '@/lib/auth-client';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string | null;
};

type SignInResult = {
  error: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isPending: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(user: {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    role: user.role ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending } = useSession();

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    const result = await authClient.signIn.email({
      email: email.trim().toLowerCase(),
      password,
    });

    if (result.error || !result.data) {
      return { error: 'E-mail ou senha inválidos.' };
    }

    if (result.data.user.role !== 'admin') {
      await authClient.signOut();
      return { error: 'Esta conta não tem acesso ao painel administrativo.' };
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = data?.user ? toAuthUser(data.user) : null;

    return {
      user,
      isPending,
      isAuthenticated: user !== null,
      isAdmin: user?.role === 'admin',
      signIn,
      signOut,
    };
  }, [data?.user, isPending, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
