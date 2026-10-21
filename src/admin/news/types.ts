import type { Category, Localized, Media } from "@/admin/types";

export type NewsStatus = "draft" | "published" | "archived";

export interface AdminNews {
  id: number;
  slug: string;
  title: Localized;
  excerpt: Localized;
  /** Only on a single article, not in the list. */
  body?: Localized;
  category: Category | null;
  cover: Media | null;
  status: NewsStatus;
  is_scheduled: boolean;
  published_at: string | null;
  is_featured: boolean;
  seo?: { title: Localized; description: Localized };
  author: { id: number; name: string } | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  can: { delete: boolean; restore: boolean; change_slug: boolean };
}

/** Status shown to staff, including "scheduled" and "in the bin". */
export type NewsDisplayStatus = NewsStatus | "scheduled" | "trashed";

export function displayStatus(news: AdminNews): NewsDisplayStatus {
  if (news.deleted_at) return "trashed";
  if (news.is_scheduled) return "scheduled";
  return news.status;
}

export const STATUS_LABELS: Record<NewsDisplayStatus, string> = {
  draft: "Brouillon",
  published: "Publiée",
  scheduled: "Programmée",
  archived: "Archivée",
  trashed: "Corbeille",
};

export const NEWS_QUERY_KEY = ["admin", "news"] as const;
export const NEWS_CATEGORIES_QUERY_KEY = ["news-categories"] as const;
