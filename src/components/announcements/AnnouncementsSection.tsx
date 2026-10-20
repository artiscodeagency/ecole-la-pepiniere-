import { CalendarClock, Info, Megaphone, Pin, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/useLanguage";
import { forSections, type Importance, type PublicAnnouncement, useAnnouncements } from "@/lib/api/publicAnnouncements";
import { useApiText, useLongDate } from "@/lib/api/useApiText";
import { cn } from "@/lib/utils";

const IMPORTANCE: Record<Importance, { fr: string; en: string; icon: typeof Info; badge: string; card: string }> = {
  urgent: {
    fr: "Urgent",
    en: "Urgent",
    icon: TriangleAlert,
    badge: "bg-accent-yellow text-ink",
    card: "border-accent-yellow ring-2 ring-accent-yellow/50",
  },
  important: {
    fr: "Important",
    en: "Important",
    icon: Megaphone,
    badge: "bg-primary-light text-primary-dark",
    card: "border-primary/50",
  },
  info: {
    fr: "Information",
    en: "Information",
    icon: Info,
    badge: "bg-surface-alt text-ink-soft",
    card: "border-border-soft",
  },
};

function AnnouncementCard({ announcement }: { announcement: PublicAnnouncement }) {
  const { lang, t } = useLanguage();
  const text = useApiText();
  const longDate = useLongDate();
  const style = IMPORTANCE[announcement.importance];
  const Icon = style.icon;

  return (
    <article className={cn("flex h-full flex-col rounded-[24px_14px_24px_14px] border bg-white p-6 shadow-soft", style.card)}>
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1", style.badge)}>
          <Icon size={14} aria-hidden="true" />
          {lang === "fr" ? style.fr : style.en}
        </span>
        {announcement.is_pinned && (
          <span className="inline-flex items-center gap-1 text-ink-soft">
            <Pin size={13} aria-hidden="true" />
            {t("Épinglée", "Pinned")}
          </span>
        )}
        <span className="text-ink-soft">· {announcement.section ? text(announcement.section.name) : t("Toute l'école", "Whole school")}</span>
      </div>
      <h3 className="mt-4 text-lg font-bold leading-snug text-ink">{text(announcement.title)}</h3>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{text(announcement.message)}</p>
      <p className="mt-auto flex items-center gap-2 pt-5 text-xs font-medium text-ink-soft">
        <CalendarClock size={15} aria-hidden="true" />
        {t(`Jusqu'au ${longDate(announcement.ends_at)}`, `Until ${longDate(announcement.ends_at)}`)}
      </p>
    </article>
  );
}

interface AnnouncementsSectionProps {
  /** Section slugs of the page; every announcement when left out. */
  sections?: string[];
  className?: string;
}

/**
 * The announcements in progress. Nothing at all is shown while loading, on
 * error or when there is none: the page then looks as it did before.
 */
export function AnnouncementsSection({ sections, className }: AnnouncementsSectionProps) {
  const { t } = useLanguage();
  const { hash } = useLocation();
  const announcements = useAnnouncements();
  const shown = forSections(announcements.data ?? [], sections);
  const visible = shown.length > 0;

  // "/actualites#annonces" (link of the banner): the block appears once loaded.
  useEffect(() => {
    if (visible && hash === "#annonces") document.getElementById("annonces")?.scrollIntoView({ block: "start" });
  }, [visible, hash]);

  if (!visible) return null;

  return (
    <section id="annonces" className={cn("relative scroll-mt-24 overflow-hidden px-6 py-20 lg:px-10 lg:py-24", className)}>
      <div className="relative mx-auto max-w-6xl">
        <Reveal delay={0.05}>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium tracking-[0.18em] text-primary">{t("ANNONCES", "ANNOUNCEMENTS")}</p>
            <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">{t("Les annonces en cours.", "Current announcements.")}</h2>
          </div>
        </Reveal>
        <div
          className={cn(
            "mt-12 grid gap-5",
            shown.length === 1 && "mx-auto max-w-2xl",
            shown.length > 1 && "md:grid-cols-2",
            shown.length > 2 && "lg:grid-cols-3",
          )}
        >
          {shown.map((announcement, index) => (
            <Reveal key={announcement.id} delay={0.1 + Math.min(index, 5) * 0.06}>
              <AnnouncementCard announcement={announcement} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
