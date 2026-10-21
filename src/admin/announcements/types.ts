import type { BadgeTone } from "@/admin/components/StatusBadge";
import type { Category, ContentStatus, Localized } from "@/admin/types";

export type AnnouncementImportance = "info" | "important" | "urgent";

/** What visitors see right now, computed by the API. */
export type AnnouncementDisplayStatus = "draft" | "scheduled" | "active" | "expired" | "archived" | "trashed";

export interface AdminAnnouncement {
  id: number;
  title: Localized;
  message: Localized;
  importance: AnnouncementImportance;
  /** null: the whole school. */
  section: Category | null;
  starts_at: string;
  ends_at: string;
  status: ContentStatus;
  display_status: AnnouncementDisplayStatus;
  is_pinned: boolean;
  author: { id: number; name: string } | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  can: { delete: boolean; restore: boolean };
}

export const DISPLAY_STATUS: Record<AnnouncementDisplayStatus, { label: string; tone: BadgeTone }> = {
  draft: { label: "Brouillon", tone: "neutral" },
  scheduled: { label: "Programmée", tone: "warning" },
  active: { label: "En ligne", tone: "success" },
  expired: { label: "Expirée", tone: "muted" },
  archived: { label: "Archivée", tone: "muted" },
  trashed: { label: "Corbeille", tone: "danger" },
};

export const IMPORTANCE: Record<AnnouncementImportance, { label: string; tone: BadgeTone }> = {
  info: { label: "Information", tone: "neutral" },
  important: { label: "Important", tone: "warning" },
  urgent: { label: "Urgent", tone: "danger" },
};

export const ANNOUNCEMENTS_QUERY_KEY = ["admin", "announcements"] as const;
