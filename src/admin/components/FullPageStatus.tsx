import { Loader2, WifiOff } from "lucide-react";

interface FullPageStatusProps {
  message: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

/** Whole-screen waiting or connection-error state. */
export function FullPageStatus({ message, loading = false, actionLabel, onAction }: FullPageStatusProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-alt px-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary-dark">
        {loading ? <Loader2 size={22} className="animate-spin" /> : <WifiOff size={22} />}
      </span>
      <p role={loading ? "status" : "alert"} className="max-w-sm text-sm text-ink-soft">
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-btn bg-primary-dark px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-ink"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
