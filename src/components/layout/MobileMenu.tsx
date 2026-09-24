import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Logo } from "@/components/layout/Logo";
import type { NavLink as NavigationLink } from "@/data/navigation";
import { useLanguage } from "@/i18n/useLanguage";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navLinks: NavigationLink[];
}

export function MobileMenu({ open, onClose, navLinks }: MobileMenuProps) {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : {
        type: "tween" as const,
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const,
      };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label={t("Fermer le menu", "Close menu")}
            className="fixed inset-0 z-40 bg-ink/30 xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-soft-lg xl:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={panelTransition}
          >
            <div className="flex h-20 items-center justify-between px-6">
              <Logo />
              <button
                type="button"
                aria-label={t("Fermer le menu", "Close menu")}
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-btn text-ink transition-colors hover:bg-surface-alt"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `rounded-btn px-3 py-3.5 text-base font-medium transition-colors hover:bg-surface-alt hover:text-primary ${isActive ? "bg-primary-light text-primary" : "text-ink"}`
                  }
                >
                  {t(link.label)}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center justify-between border-t border-border-soft px-6 py-4">
              <span className="text-sm font-medium text-ink-soft">
                {t("Langue", "Language")}
              </span>
              <LanguageSwitcher />
            </div>

            <div className="flex flex-col gap-3 border-t border-border-soft px-6 py-6">
              <Link
                to="/admissions"
                onClick={onClose}
                className="rounded-btn bg-primary px-5 py-3.5 text-center text-sm font-medium text-white shadow-soft transition-colors hover:bg-primary-dark"
              >
                Admissions
              </Link>
              <Link
                to="/contact"
                onClick={onClose}
                className="rounded-btn border border-border-soft px-5 py-3.5 text-center text-sm font-medium text-ink transition-colors hover:bg-surface-alt"
              >
                Contact
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
