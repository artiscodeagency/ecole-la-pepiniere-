export type ToastTone = "success" | "error" | "warning" | "info";

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  /** Milliseconds before it closes by itself. */
  duration: number;
  /** A button in the notice, e.g. "Voir" opening the new message. */
  action?: ToastAction;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
}

/** Errors stay longer: they usually need reading. */
const DURATIONS: Record<ToastTone, number> = { success: 4_000, info: 5_000, warning: 7_000, error: 8_000 };
/** Older notices make room beyond this number. */
const MAX_VISIBLE = 4;

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToasts() {
  return toasts;
}

export function dismissToast(id: number) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

function show(tone: ToastTone, title: string, description?: string, action?: ToastAction) {
  // The same notice twice in a row (double click…) is shown once.
  const last = toasts.at(-1);
  if (last && last.tone === tone && last.title === title && last.description === description) return last.id;

  const toast: Toast = { id: nextId++, tone, title, description, duration: DURATIONS[tone], action };
  toasts = [...toasts, toast].slice(-MAX_VISIBLE);
  emit();
  return toast.id;
}

/**
 * Notices of the admin, usable anywhere (components, React Query handlers):
 * `toast.success("Actualité publiée")`, `toast.error("…", "détail")`.
 */
export const toast = {
  success: (title: string, description?: string) => show("success", title, description),
  error: (title: string, description?: string) => show("error", title, description),
  warning: (title: string, description?: string) => show("warning", title, description),
  info: (title: string, description?: string, action?: ToastAction) => show("info", title, description, action),
};
