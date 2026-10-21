import { BellRing, X } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import type { InboxNotice } from "@/admin/lib/useLiveInbox";

/** Short notice when a message or a request arrives; it closes itself after 8 s. */
export function InboxToast({ notice, onClose }: { notice: InboxNotice | null; onClose: () => void }) {
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(onClose, 8_000);
    return () => window.clearTimeout(timer);
  }, [notice, onClose]);

  if (!notice) return null;

  return (
    <div
      key={notice.id}
      role="status"
      className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-card border border-border-soft bg-white py-3 pl-4 pr-2 shadow-soft-lg"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
        <BellRing size={18} aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-ink">{notice.text}</p>
      <Link
        to={notice.path}
        onClick={onClose}
        className="rounded-btn px-2 py-1 text-sm font-semibold text-primary-dark transition-colors hover:bg-primary-light"
      >
        Voir
      </Link>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer la notification"
        className="flex h-8 w-8 items-center justify-center rounded-btn text-ink-soft transition-colors hover:bg-surface-alt"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
