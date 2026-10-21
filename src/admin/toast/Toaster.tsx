import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { dismissToast, getToasts, subscribe, type Toast, type ToastTone } from "@/admin/toast/store";
import { cn } from "@/lib/utils";

const TONES: Record<ToastTone, { icon: typeof Info; accent: string; bar: string }> = {
  success: { icon: CheckCircle2, accent: "text-emerald-600 bg-emerald-50", bar: "bg-emerald-500" },
  error: { icon: AlertCircle, accent: "text-red-600 bg-red-50", bar: "bg-red-500" },
  warning: { icon: TriangleAlert, accent: "text-amber-600 bg-amber-50", bar: "bg-amber-500" },
  info: { icon: Info, accent: "text-primary-dark bg-primary-light", bar: "bg-primary" },
};

function ToastItem({ toast }: { toast: Toast }) {
  const [paused, setPaused] = useState(false);
  // Time left, kept when the pointer pauses the countdown.
  const remaining = useRef(toast.duration);
  const style = TONES[toast.tone];
  const Icon = style.icon;

  useEffect(() => {
    if (paused) return;
    const startedAt = Date.now();
    const timer = window.setTimeout(() => dismissToast(toast.id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [paused, toast.id]);

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-card border border-border-soft bg-white py-3 pl-3 pr-2 shadow-soft-lg motion-safe:animate-[toast-in_180ms_ease-out]"
    >
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", style.accent)}>
        <Icon size={17} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <p className="text-sm font-semibold text-ink">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{toast.description}</p>}
      </div>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            dismissToast(toast.id);
          }}
          className="shrink-0 self-center rounded-btn px-2 py-1 text-sm font-semibold text-primary-dark transition-colors hover:bg-primary-light"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        aria-label="Fermer la notification"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-btn text-ink-soft transition-colors hover:bg-surface-alt hover:text-ink"
      >
        <X size={16} aria-hidden="true" />
      </button>
      {/* Countdown before it closes; stops while the pointer is on the notice. */}
      <span
        aria-hidden="true"
        className={cn("absolute bottom-0 left-0 h-0.5 w-full origin-left", style.bar)}
        style={{
          animation: `toast-countdown ${toast.duration}ms linear forwards`,
          animationPlayState: paused ? "paused" : "running",
        }}
      />
    </div>
  );
}

/** The stack of notices, top right on desktop, at the bottom on phones. */
export function Toaster() {
  const toasts = useSyncExternalStore(subscribe, getToasts);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-60 flex flex-col gap-2 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:w-96"
    >
      <style>{`
        @keyframes toast-in { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes toast-countdown { from { transform: scaleX(1); } to { transform: scaleX(0); } }
      `}</style>
      {toasts.map((item) => (
        <ToastItem key={item.id} toast={item} />
      ))}
    </div>
  );
}
