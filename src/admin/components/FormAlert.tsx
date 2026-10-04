import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FormAlertProps {
  tone: "error" | "success";
  children: ReactNode;
}

export function FormAlert({ tone, children }: FormAlertProps) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-btn border px-4 py-3 text-sm leading-relaxed",
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-primary/30 bg-primary-light text-ink",
      )}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
