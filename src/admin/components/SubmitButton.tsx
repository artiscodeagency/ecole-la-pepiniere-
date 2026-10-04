import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface SubmitButtonProps {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
}

/** Primary form button; disabled while the request runs, to avoid double sending. */
export function SubmitButton({ pending, pendingLabel, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-btn bg-primary-dark px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-ink disabled:cursor-wait disabled:opacity-70"
    >
      {pending && <Loader2 size={17} className="animate-spin" aria-hidden="true" />}
      {pending ? pendingLabel : children}
    </button>
  );
}
