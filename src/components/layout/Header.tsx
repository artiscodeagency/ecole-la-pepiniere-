import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NAV_LINKS } from "@/data/navigation";
import { useLanguage } from "@/i18n/useLanguage";
import { cn } from "@/lib/utils";

export function Header() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-300",
        scrolled
          ? "border-border-soft bg-white shadow-soft"
          : "border-transparent bg-white",
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-4 min-[360px]:gap-4 min-[360px]:px-6 lg:px-10">
        <Logo className="shrink-0" />

        <nav className="hidden items-center gap-6 xl:flex 2xl:gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `whitespace-nowrap text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-ink-soft"}`
              }
            >
              {t(link.label)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <NavLink
            to="/contact"
            className="px-2 text-sm font-medium text-ink transition-colors hover:text-primary"
          >
            Contact
          </NavLink>
          <NavLink
            to="/admissions"
            className="rounded-btn bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-primary-dark"
          >
            Admissions
          </NavLink>
          <span aria-hidden className="mx-1 h-6 w-px bg-border-soft" />
          <LanguageSwitcher />
        </div>

        <div className="flex shrink-0 items-center gap-1 min-[360px]:gap-2 xl:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            aria-label={t("Ouvrir le menu", "Open menu")}
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-btn text-ink transition-colors hover:bg-surface-alt"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navLinks={NAV_LINKS}
      />
    </header>
  );
}
