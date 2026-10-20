import { useInfiniteQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import type { ApiText, PublicCategory, PublicImage } from "@/lib/api/publicNews";

export interface PublicEvent {
  id: number;
  title: ApiText;
  description: ApiText;
  /** "2026-10-22", a day without time zone. */
  event_date: string;
  /** Last day of an event over several days. */
  end_date: string | null;
  /** "07:30" */
  start_time: string | null;
  end_time: string | null;
  location: ApiText;
  /** null: the whole school. */
  section: PublicCategory | null;
  category: PublicCategory | null;
  image: PublicImage | null;
  is_cancelled: boolean;
}

interface EventsPage {
  data: PublicEvent[];
  meta: { current_page: number; last_page: number; total: number };
}

/**
 * The events not finished yet, soonest first (the server leaves out drafts
 * and past ones; a cancelled one stays, flagged). 12 per page.
 */
export function useUpcomingEvents() {
  return useInfiniteQuery({
    queryKey: ["public", "events", "upcoming"],
    queryFn: ({ pageParam }) => api<EventsPage>(`/public/events?page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
    refetchInterval: 30 * 60_000,
  });
}

/** "2026-10-22" as that day at midnight, local time (not UTC, which can shift the day). */
export function parseDay(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date);
}
