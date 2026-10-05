import { type AdminNews, displayStatus, type NewsDisplayStatus, STATUS_LABELS } from "@/admin/news/types";
import { cn } from "@/lib/utils";

const TONES: Record<NewsDisplayStatus, string> = {
  draft: "bg-surface-alt text-ink-soft border-border-soft",
  published: "bg-primary-light text-primary-dark border-primary/30",
  scheduled: "bg-accent-yellow/25 text-ink border-accent-yellow/60",
  archived: "bg-white text-ink-soft border-border-soft",
  trashed: "bg-red-50 text-red-800 border-red-200",
};

export function NewsStatusBadge({ news }: { news: AdminNews }) {
  const status = displayStatus(news);

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", TONES[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}
