import { createContext } from "react";

import type { AdminUser } from "@/admin/types";

export const ME_QUERY_KEY = ["auth", "me"] as const;

export type AuthStatus = "loading" | "authenticated" | "guest" | "error";

export interface AuthContextValue {
  status: AuthStatus;
  /** Signed-in user, or null for a guest (undefined while loading). */
  user: AdminUser | null | undefined;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => Promise<void>;
  /** Tries again to read the session after a connection error. */
  retry: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
