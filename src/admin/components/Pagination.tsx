import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Paginated } from "@/admin/types";

interface PaginationProps {
  meta: Paginated<unknown>["meta"];
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.last_page <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-4 text-sm text-ink-soft">
      <p>
        {meta.from}–{meta.to} sur {meta.total}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(meta.current_page - 1)}
          disabled={meta.current_page <= 1}
          className="flex items-center gap-1 rounded-btn border border-border-soft bg-white px-3 py-2 font-medium text-ink transition-colors hover:bg-surface-alt disabled:opacity-50"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Précédente
        </button>
        <button
          type="button"
          onClick={() => onPageChange(meta.current_page + 1)}
          disabled={meta.current_page >= meta.last_page}
          className="flex items-center gap-1 rounded-btn border border-border-soft bg-white px-3 py-2 font-medium text-ink transition-colors hover:bg-surface-alt disabled:opacity-50"
        >
          Suivante
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
