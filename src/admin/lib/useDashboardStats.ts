import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";

export interface DashboardStats {
  news_published: number;
  announcements_active: number;
  gallery_photos: number;
  messages_unread: number;
  admission_requests_new: number;
  events_upcoming: number;
}

/**
 * The dashboard counts, also used for the "unread" badges of the menu.
 * The hosting has no push server, so they are checked often instead: every
 * 10 s while the admin is on screen, every 30 s in a background tab (for
 * the count in the tab title), at once when the tab comes back, and when a
 * message or request is treated (those pages invalidate this query).
 */
export function useDashboardStats(enabled = true) {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => (await api<{ data: DashboardStats }>("/admin/dashboard")).data,
    staleTime: 5_000,
    refetchInterval: () => (document.hidden ? 30_000 : 10_000),
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    enabled,
  });
}
