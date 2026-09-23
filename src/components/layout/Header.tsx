import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NAV_LINKS } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function Header() {
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
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-ink-soft"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
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
        </div>

        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-btn text-ink transition-colors hover:bg-surface-alt lg:hidden"
        >
          <Menu size={22} />
        </button>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navLinks={NAV_LINKS}
      />
    </header>
  );
}
