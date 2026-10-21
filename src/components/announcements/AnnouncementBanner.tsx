import { ArrowRight, Megaphone, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useLanguage } from "@/i18n/useLanguage";
import { useAnnouncements } from "@/lib/api/publicAnnouncements";
import { useApiText } from "@/lib/api/useApiText";

const DISMISSED_KEY = "pepiniere-dismissed-announcements";

function readDismissed(): number[] {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) ?? "[]") as number[];
  } catch {
    return [];
  }
}

/**
 * Urgent or pinned announcements, under the header of every page. Closing
 * one hides it for the rest of the visit only.
 */
export function AnnouncementBanner() {
  const { t } = useLanguage();
  const text = useApiText();
  const announcements = useAnnouncements();
  const [dismissed, setDismissed] = useState(readDismissed);

  const shown = (announcements.data ?? []).filter((item) => (item.is_pinned || item.importance === "urgent") && !dismissed.includes(item.id));
  const first = shown[0];
  if (!first) return null;

  const dismiss = () => {
    const next = [...dismissed, first.id];
    setDismissed(next);
    try {
      sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
    } catch {
      // Without storage, it comes back on the next page: nothing breaks.
    }
  };

  const Icon = first.importance === "urgent" ? TriangleAlert : Megaphone;

  return (
    <div role="region" aria-label={t("Annonce", "Announcement")} className="border-b border-accent-yellow bg-accent-yellow/90 text-ink">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 min-[360px]:px-6 lg:px-10">
        <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1 text-sm leading-relaxed">
          <p>
            <span className="font-bold">{text(first.title)}</span>
            {text(first.message) && <span className="hidden sm:inline"> — </span>}
            <span className="line-clamp-2 sm:inline">{text(first.message)}</span>
          </p>
          <Link to="/actualites#annonces" className="mt-1 inline-flex items-center gap-1.5 font-semibold underline-offset-2 hover:underline">
            {shown.length > 1
              ? t(`Voir les ${shown.length} annonces importantes`, `See the ${shown.length} important announcements`)
              : t("Voir les annonces", "See the announcements")}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("Masquer cette annonce", "Hide this announcement")}
          className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-btn transition-colors hover:bg-ink/10"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
