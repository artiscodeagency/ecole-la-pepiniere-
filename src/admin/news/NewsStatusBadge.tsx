import { type BadgeTone, StatusBadge } from "@/admin/components/StatusBadge";
import { type AdminNews, displayStatus, type NewsDisplayStatus, STATUS_LABELS } from "@/admin/news/types";

const TONES: Record<NewsDisplayStatus, BadgeTone> = {
  draft: "neutral",
  published: "success",
  scheduled: "warning",
  archived: "muted",
  trashed: "danger",
};

export function NewsStatusBadge({ news }: { news: AdminNews }) {
  const status = displayStatus(news);

  return <StatusBadge tone={TONES[status]}>{STATUS_LABELS[status]}</StatusBadge>;
}
