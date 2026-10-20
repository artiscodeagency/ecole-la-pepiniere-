import type { BadgeTone } from "@/admin/components/StatusBadge";
import type { Paginated } from "@/admin/types";

export type MessageStatus = "new" | "read" | "handled";

export interface AdminContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  /** Only on a single message, not in the list. */
  message: string | null;
  excerpt: string;
  status: MessageStatus;
  read_at: string | null;
  handled_at: string | null;
  handled_by: string | null;
  internal_note?: string | null;
  created_at: string;
  can: { delete: boolean };
}

export type MessagePage = Paginated<AdminContactMessage> & { counts: Record<MessageStatus, number> };

export const MESSAGE_STATUS: Record<MessageStatus, { label: string; tone: BadgeTone }> = {
  new: { label: "Nouveau", tone: "warning" },
  read: { label: "Lu", tone: "neutral" },
  handled: { label: "Traité", tone: "success" },
};

export const MESSAGES_QUERY_KEY = ["admin", "contact-messages"] as const;
