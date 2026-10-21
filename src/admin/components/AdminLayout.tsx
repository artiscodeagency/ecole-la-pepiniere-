import { Loader2, Menu, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { Sidebar } from "@/admin/components/Sidebar";
import { useLiveInbox } from "@/admin/lib/useLiveInbox";
import officialLogo from "@/assets/logo-transparent.png";

/** Frame of every signed-in page: sidebar on desktop, drawer menu on mobile. */
export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  // pending: a dot on the closed mobile menu when messages or requests are waiting.
  const { pending } = useLiveInbox();

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-surface-alt lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border-soft bg-white lg:block">
        <Sidebar />
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border-soft bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <img src={officialLogo} alt="" className="h-8 w-8 object-contain" />
          <span className="font-bold text-ink">La Pépinière</span>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
          className="relative flex h-10 w-10 items-center justify-center rounded-btn text-ink transition-colors hover:bg-surface-alt"
        >
          <Menu size={22} />
          {pending > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" aria-hidden="true" />
          )}
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={closeMenu}
            className="absolute inset-0 bg-ink/30"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-soft-lg">
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Fermer le menu"
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-btn text-ink transition-colors hover:bg-surface-alt"
            >
              <X size={20} />
            </button>
            <Sidebar onNavigate={closeMenu} />
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <Suspense
          fallback={
            <p role="status" className="flex items-center gap-2 py-10 text-sm text-ink-soft">
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Chargement…
            </p>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
