import { ExternalLink, LogOut, UserCircle } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "@/admin/auth/useAuth";
import { type NavItem, navigationFor } from "@/admin/navigation";
import { PATHS } from "@/admin/paths";
import { ROLE_LABELS } from "@/admin/types";
import officialLogo from "@/assets/logo-transparent.png";
import { cn } from "@/lib/utils";

const ITEM_CLASSES = "flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors";

function NavEntry({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;

  if (!item.available) {
    return (
      <span aria-disabled="true" className={cn(ITEM_CLASSES, "cursor-default text-ink-soft/60")}>
        <Icon size={18} aria-hidden="true" />
        <span className="flex-1">{item.label}</span>
        <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft/70">
          Bientôt
        </span>
      </span>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={item.path === PATHS.home}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          ITEM_CLASSES,
          isActive
            ? "bg-primary-light font-semibold text-primary-dark"
            : "text-ink-soft hover:bg-surface-alt hover:text-ink",
        )
      }
    >
      <Icon size={18} aria-hidden="true" />
      {item.label}
    </NavLink>
  );
}

/** Admin menu, used in the desktop sidebar and in the mobile drawer. */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border-soft px-5">
        <img src={officialLogo} alt="" className="h-9 w-9 object-contain" />
        <div className="leading-tight">
          <p className="font-bold text-ink">La Pépinière</p>
          <p className="text-[11px] font-medium tracking-[0.14em] text-primary-dark">ADMINISTRATION</p>
        </div>
      </div>

      <nav aria-label="Administration" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navigationFor(user).map((group, index) => (
          <div key={group.title ?? index}>
            {group.title && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft/80">
                {group.title}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavEntry item={item} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-1 border-t border-border-soft px-3 py-4">
        <div className="mb-2 px-3">
          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
          <p className="text-xs text-ink-soft">{ROLE_LABELS[user.role]}</p>
        </div>
        <NavEntry item={{ label: "Mon profil", path: PATHS.profile, icon: UserCircle, available: true }} onNavigate={onNavigate} />
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(ITEM_CLASSES, "text-ink-soft hover:bg-surface-alt hover:text-ink")}
        >
          <ExternalLink size={18} aria-hidden="true" />
          Voir le site public
        </a>
        <button
          type="button"
          onClick={handleLogout}
          disabled={signingOut}
          className={cn(ITEM_CLASSES, "w-full text-ink-soft hover:bg-surface-alt hover:text-ink disabled:opacity-60")}
        >
          <LogOut size={18} aria-hidden="true" />
          {signingOut ? "Déconnexion…" : "Se déconnecter"}
        </button>
      </div>
    </div>
  );
}
