import { LogOut } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/admin/auth/useAuth";
import { ROLE_LABELS } from "@/admin/types";
import officialLogo from "@/assets/logo-transparent.png";
import { usePageMeta } from "@/lib/usePageMeta";

/** First page after signing in. The dashboard takes its place in the next module. */
export function HomePage() {
  const { user, logout } = useAuth();
  const [pending, setPending] = useState(false);

  usePageMeta("Accueil | Administration La Pépinière", "Espace d'administration de La Pépinière.");

  if (!user) return null;

  const handleLogout = async () => {
    setPending(true);
    try {
      await logout();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="border-b border-border-soft bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src={officialLogo} alt="" className="h-9 w-9 object-contain" />
            <span className="font-bold text-ink">La Pépinière</span>
            <span className="hidden text-sm text-ink-soft sm:inline">· Administration</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={pending}
            className="flex items-center gap-2 rounded-btn border border-border-soft px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-alt disabled:opacity-60"
          >
            <LogOut size={16} aria-hidden="true" />
            Se déconnecter
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-sm font-medium tracking-[0.18em] text-primary-dark">
          {ROLE_LABELS[user.role].toUpperCase()}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Bienvenue, {user.name}</h1>
        <p className="mt-2 text-ink-soft">Vous êtes connecté avec l'adresse {user.email}.</p>
      </main>
    </div>
  );
}
