import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import type { ApiText, PublicCategory } from "@/lib/api/publicNews";

export type Importance = "info" | "important" | "urgent";

export interface PublicAnnouncement {
  id: number;
  title: ApiText;
  message: ApiText;
  importance: Importance;
  /** null: the whole school. */
  section: PublicCategory | null;
  starts_at: string;
  ends_at: string;
  is_pinned: boolean;
}

/**
 * The active announcements (the server leaves out drafts and expired ones),
 * already sorted: pinned, then urgent, important, information. One request
 * serves the banner and every block of the site.
 */
export function useAnnouncements() {
  return useQuery({
    queryKey: ["public", "announcements"],
    queryFn: async () => (await api<{ data: PublicAnnouncement[] }>("/public/announcements")).data,
    // A page left open past the end date stops showing it too.
    select: (items) => items.filter((item) => new Date(item.ends_at).getTime() > Date.now()),
    refetchInterval: 10 * 60_000,
  });
}

/** For a section page: its own announcements and those for the whole school. */
export function forSections(announcements: PublicAnnouncement[], sectionSlugs: string[] | undefined) {
  if (!sectionSlugs) return announcements;
  return announcements.filter((item) => item.section === null || sectionSlugs.includes(item.section.slug));
}
