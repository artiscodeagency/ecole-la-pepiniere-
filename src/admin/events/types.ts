import type { BadgeTone } from "@/admin/components/StatusBadge";
import type { Category, Localized, Media } from "@/admin/types";

export type EventStatus = "draft" | "published" | "cancelled" | "archived";

/** What visitors see today, computed by the API in the school's timezone. */
export type EventDisplayStatus = "draft" | "upcoming" | "ongoing" | "past" | "cancelled" | "archived" | "trashed";

export interface AdminEvent {
  id: number;
  title: Localized;
  description: Localized;
  /** "YYYY-MM-DD" */
  event_date: string;
  end_date: string | null;
  /** "HH:MM" */
  start_time: string | null;
  end_time: string | null;
  location: Localized;
  section: Category | null;
  category: Category | null;
  image: Media | null;
  status: EventStatus;
  display_status: EventDisplayStatus;
  author: { id: number; name: string } | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  can: { delete: boolean; restore: boolean };
}

export const DISPLAY_STATUS: Record<EventDisplayStatus, { label: string; tone: BadgeTone }> = {
  draft: { label: "Brouillon", tone: "neutral" },
  upcoming: { label: "À venir", tone: "success" },
  ongoing: { label: "En cours", tone: "success" },
  past: { label: "Passé", tone: "muted" },
  cancelled: { label: "Annulé", tone: "danger" },
  archived: { label: "Archivé", tone: "muted" },
  trashed: { label: "Corbeille", tone: "danger" },
};

export const EVENTS_QUERY_KEY = ["admin", "events"] as const;

const dayFormat = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

/** "2026-10-12" read as a calendar day, without any timezone shift. */
function calendarDay(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** "sam. 12 oct. 2026 · 08:00–12:00", or "du … au …" over several days. */
export function formatEventWhen(event: Pick<AdminEvent, "event_date" | "end_date" | "start_time" | "end_time">) {
  const days = event.end_date
    ? `du ${dayFormat.format(calendarDay(event.event_date))} au ${dayFormat.format(calendarDay(event.end_date))}`
    : dayFormat.format(calendarDay(event.event_date));
  const hours = [event.start_time, event.end_time].filter(Boolean).join("–");
  return hours ? `${days} · ${hours}` : days;
}
