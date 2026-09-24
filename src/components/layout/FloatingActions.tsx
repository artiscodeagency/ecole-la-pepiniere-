import { ArrowUp, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { useLanguage } from "@/i18n/useLanguage";

const WHATSAPP_HREF = "/contact#contact-form";

export function FloatingActions() {
  const { t } = useLanguage();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setShowScrollTop(window.scrollY > 320);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      {showScrollTop && (
        <button
          type="button"
          aria-label={t("Revenir en haut de la page", "Back to top of the page")}
          title={t("Revenir en haut", "Back to top")}
          onClick={scrollToTop}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border-soft bg-white text-primary shadow-soft-lg transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary-light"
        >
          <ArrowUp size={19} strokeWidth={2.2} />
        </button>
      )}

      <a
        href={WHATSAPP_HREF}
        aria-label={t("Contacter l'école sur WhatsApp", "Contact the school on WhatsApp")}
        title={t("Nous contacter sur WhatsApp", "Contact us on WhatsApp")}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-white shadow-soft-lg transition-transform duration-200 hover:-translate-y-1 hover:bg-secondary-dark"
      >
        <MessageCircle size={25} strokeWidth={2} />
      </a>
    </div>
  );
}
