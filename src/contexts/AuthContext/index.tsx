"use client";

import { ContextOutOfScopeError } from "@/domain/errors/context-out-of-scope.error";
import { authClient, useSession } from "@/lib/auth-client";
import { createContext, useCallback, useContext, useMemo } from "react";

interface IAuthUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string | null;
}

interface ISignInResult {
  error: string | null;
}

interface IAuthContextValue {
  user: IAuthUser | null;
  isPending: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<ISignInResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<IAuthContextValue | null>(null);

function toAuthUser(user: {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
}): IAuthUser {
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

  const signIn = useCallback(
    async (email: string, password: string): Promise<ISignInResult> => {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.error || !result.data) {
        return { error: "E-mail ou senha inválidos." };
      }

      if (result.data.user.role !== "admin") {
        await authClient.signOut();
        return { error: "Esta conta não tem acesso ao painel administrativo." };
      }

      return { error: null };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await authClient.signOut();
  }, []);

  const value = useMemo<IAuthContextValue>(() => {
    const user = data?.user ? toAuthUser(data.user) : null;

    return {
      user,
      isPending,
      isAuthenticated: user !== null,
      isAdmin: user?.role === "admin",
      signIn,
      signOut,
    };
  }, [data?.user, isPending, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new ContextOutOfScopeError("AuthContext");
  }
  return ctx;
}
