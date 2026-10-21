import { ArrowRight, CalendarDays, Clock, Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { NewsCover } from "@/components/news/NewsCard";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/useLanguage";
import { parseDay, type PublicEvent, useUpcomingEvents } from "@/lib/api/publicEvents";
import { useApiText } from "@/lib/api/useApiText";
import { cn } from "@/lib/utils";

/** Beyond this length, the description is folded behind "Lire la suite" (there is no event page). */
const LONG_DESCRIPTION = 220;

function EventCard({ event }: { event: PublicEvent }) {
  const { lang, t } = useLanguage();
  const text = useApiText();
  const [expanded, setExpanded] = useState(false);

  const locale = lang === "fr" ? "fr-FR" : "en-GB";
  const start = parseDay(event.event_date);
  const end = event.end_date && event.end_date !== event.event_date ? parseDay(event.end_date) : null;
  const longFormat = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const days = end ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).formatRange(start, end) : longFormat.format(start);
  const hours = event.start_time
    ? event.end_time
      ? `${event.start_time} – ${event.end_time}`
      : t(`À partir de ${event.start_time}`, `From ${event.start_time}`)
    : null;
  const description = text(event.description);
  const foldable = description.length > LONG_DESCRIPTION;

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[28px_16px_28px_16px] border border-border-soft bg-white shadow-soft",
        event.is_cancelled && "opacity-80",
      )}
    >
      {event.image && (
        <div className="aspect-16/9 overflow-hidden bg-primary-light">
          <NewsCover image={event.image} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" className="h-full w-full" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start gap-4">
          <div className="flex w-16 shrink-0 flex-col items-center rounded-[16px_10px_16px_10px] bg-primary-light py-2 text-primary-dark" aria-hidden="true">
            <span className="text-2xl font-bold leading-none">{start.getDate()}</span>
            <span className="mt-1 text-xs font-semibold uppercase">{new Intl.DateTimeFormat(locale, { month: "short" }).format(start).replace(".", "")}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
              {event.is_cancelled && <span className="rounded-full bg-ink px-2.5 py-1 text-white">{t("Annulé", "Cancelled")}</span>}
              {event.category && <span className="rounded-full bg-secondary-light px-2.5 py-1 text-secondary-dark">{text(event.category.name)}</span>}
              <span className="text-ink-soft">{event.section ? text(event.section.name) : t("Toute l'école", "Whole school")}</span>
            </p>
            <h3 className={cn("mt-3 text-lg font-bold leading-snug text-ink", event.is_cancelled && "line-through decoration-ink/40")}>
              {text(event.title)}
            </h3>
          </div>
        </div>

        <ul className="mt-5 space-y-2 text-sm text-ink-soft">
          <li className="flex items-start gap-2.5">
            <CalendarDays size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="first-letter:uppercase">{days}</span>
          </li>
          {hours && (
            <li className="flex items-start gap-2.5">
              <Clock size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <span>{hours}</span>
            </li>
          )}
          {text(event.location) && (
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <span>{text(event.location)}</span>
            </li>
          )}
        </ul>

        {description && (
          <div className="mt-4 border-t border-border-soft pt-4">
            <p className={cn("whitespace-pre-line text-sm leading-relaxed text-ink-soft", foldable && !expanded && "line-clamp-4")}>{description}</p>
            {foldable && (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                className="mt-2 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
              >
                {expanded ? t("Réduire", "Show less") : t("Lire la suite", "Read more")}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

interface AgendaSectionProps {
  /** Home page: the first events only, with a link to the full agenda. */
  limit?: number;
  className?: string;
}

/**
 * The upcoming events. Nothing at all is shown while loading, on error or
 * when there is none: the page then looks as it did before.
 */
export function AgendaSection({ limit, className }: AgendaSectionProps) {
  const { t } = useLanguage();
  const { hash } = useLocation();
  const events = useUpcomingEvents();
  const all = events.data?.pages.flatMap((page) => page.data) ?? [];
  const total = events.data?.pages[0]?.meta.total ?? 0;
  const shown = limit ? all.slice(0, limit) : all;
  const visible = shown.length > 0;

  // "/actualites#agenda" (link of the home page): the block appears once loaded.
  useEffect(() => {
    if (visible && hash === "#agenda") document.getElementById("agenda")?.scrollIntoView({ block: "start" });
  }, [visible, hash]);

  if (!visible) return null;

  return (
    <section id="agenda" className={cn("relative scroll-mt-24 overflow-hidden px-6 py-20 lg:px-10 lg:py-24", className)}>
      <div className="relative mx-auto max-w-6xl">
        <Reveal delay={0.05}>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium tracking-[0.18em] text-primary">{t("AGENDA", "CALENDAR")}</p>
            <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">{t("Les prochains rendez-vous.", "Upcoming events.")}</h2>
          </div>
        </Reveal>
        <div
          className={cn(
            "mt-12 grid gap-6",
            shown.length === 1 && "mx-auto max-w-xl",
            shown.length > 1 && "sm:grid-cols-2",
            shown.length > 2 && "lg:grid-cols-3",
          )}
        >
          {shown.map((event, index) => (
            <Reveal key={event.id} delay={0.1 + (index % 3) * 0.08}>
              <EventCard event={event} />
            </Reveal>
          ))}
        </div>
        {limit && total > limit && (
          <div className="mt-10 text-center">
            <Link
              to="/actualites#agenda"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-dark"
            >
              {t(`Voir les ${total} événements à venir`, `See the ${total} upcoming events`)} <ArrowRight size={16} />
            </Link>
          </div>
        )}
        {!limit && events.hasNextPage && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => void events.fetchNextPage()}
              disabled={events.isFetchingNextPage}
              className="inline-flex items-center gap-2 rounded-btn border border-border-soft bg-white px-5 py-3 text-sm font-medium text-ink shadow-soft transition-colors hover:bg-surface-alt disabled:opacity-60"
            >
              {events.isFetchingNextPage && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              {t("Voir plus d'événements", "See more events")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
