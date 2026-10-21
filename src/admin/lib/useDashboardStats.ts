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
 * Refreshed every minute, and at once when a message or request is treated
 * (those pages invalidate this query).
 */
export function useDashboardStats(enabled = true) {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => (await api<{ data: DashboardStats }>("/admin/dashboard")).data,
    staleTime: 30_000,
    refetchInterval: 60_000,
    enabled,
  });
}
