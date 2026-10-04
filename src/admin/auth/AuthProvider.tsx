import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useCallback, useMemo } from "react";

import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
  ME_QUERY_KEY,
} from "@/admin/auth/context";
import type { AdminUser } from "@/admin/types";
import { api, ApiError } from "@/lib/api/client";

/** The signed-in user, or null when there is no valid session. */
async function fetchCurrentUser(): Promise<AdminUser | null> {
  try {
    return (await api<{ data: AdminUser }>("/auth/me")).data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const me = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api<{ data: AdminUser }>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      queryClient.setQueryData(ME_QUERY_KEY, data);
      return data;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      // Nothing from the previous session stays in memory.
      queryClient.clear();
      queryClient.setQueryData(ME_QUERY_KEY, null);
    }
  }, [queryClient]);

  const { refetch } = me;
  const retry = useCallback(() => void refetch(), [refetch]);

  const status: AuthStatus = me.isPending
    ? "loading"
    : me.isError
      ? "error"
      : me.data
        ? "authenticated"
        : "guest";

  const value = useMemo<AuthContextValue>(
    () => ({ status, user: me.data, login, logout, retry }),
    [status, me.data, login, logout, retry],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
