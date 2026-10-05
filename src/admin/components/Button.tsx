import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary-dark text-white shadow-soft hover:bg-ink",
  secondary: "border border-border-soft bg-white text-ink hover:bg-surface-alt",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  ghost: "text-ink-soft hover:bg-surface-alt hover:text-ink",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-btn px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  pending?: boolean;
}

export function Button({ variant = "secondary", pending = false, className, children, disabled, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} disabled={disabled || pending} className={cn(BASE, VARIANTS[variant], className)} {...props}>
      {pending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function ButtonLink({ variant = "secondary", className, ...props }: LinkProps & { variant?: Variant }) {
  return <Link className={cn(BASE, VARIANTS[variant], className)} {...props} />;
}
