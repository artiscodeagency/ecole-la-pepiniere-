import { Eye, EyeOff } from "lucide-react";
import {
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useId,
  useState,
} from "react";

import { cn } from "@/lib/utils";

const INPUT_CLASSES =
  "mt-2 w-full rounded-btn border bg-white px-4 py-3 text-base font-normal text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-surface-alt disabled:text-ink-soft";

interface FieldShellProps {
  label: string;
  error?: string;
  /** Help text under the field. */
  hint?: ReactNode;
  required?: boolean;
  className?: string;
}

/** Ids linking a field to its label, help text and error, for screen readers. */
function useFieldIds(id: string | undefined, hint: ReactNode, error: string | undefined) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = [hint ? `${inputId}-hint` : null, error ? `${inputId}-error` : null].filter(Boolean).join(" ");
  return { inputId, describedBy: describedBy || undefined };
}

function FieldShell({
  inputId,
  label,
  error,
  hint,
  required,
  className,
  aside,
  children,
}: FieldShellProps & { inputId: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
          {required && (
            <span className="text-red-700" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
        {aside}
      </div>
      {children}
      {hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs leading-relaxed text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = FieldShellProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export function TextField({ label, error, hint, id, className, required, ...props }: TextFieldProps) {
  const { inputId, describedBy } = useFieldIds(id, hint, error);

  return (
    <FieldShell inputId={inputId} label={label} error={error} hint={hint} required={required} className={className}>
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(INPUT_CLASSES, error ? "border-red-400" : "border-border-soft")}
        {...props}
      />
    </FieldShell>
  );
}

type TextAreaFieldProps = FieldShellProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "value"> & {
  value: string;
};

/** Multi-line text, with a character counter when a maximum is set. */
export function TextAreaField({ label, error, hint, id, className, required, maxLength, value, ...props }: TextAreaFieldProps) {
  const { inputId, describedBy } = useFieldIds(id, hint, error);
  const counter = maxLength ? (
    <span className={cn("text-xs", value.length > maxLength ? "text-red-700" : "text-ink-soft")}>
      {value.length}/{maxLength}
    </span>
  ) : null;

  return (
    <FieldShell inputId={inputId} label={label} error={error} hint={hint} required={required} className={className} aside={counter}>
      <textarea
        id={inputId}
        required={required}
        maxLength={maxLength}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(INPUT_CLASSES, "resize-y leading-relaxed", error ? "border-red-400" : "border-border-soft")}
        {...props}
      />
    </FieldShell>
  );
}

type SelectFieldProps = FieldShellProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & { children: ReactNode };

export function SelectField({ label, error, hint, id, className, required, children, ...props }: SelectFieldProps) {
  const { inputId, describedBy } = useFieldIds(id, hint, error);

  return (
    <FieldShell inputId={inputId} label={label} error={error} hint={hint} required={required} className={className}>
      <select
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(INPUT_CLASSES, error ? "border-red-400" : "border-border-soft")}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  label: string;
  hint?: string;
  className?: string;
}

export function CheckboxField({ label, hint, id, className, ...props }: CheckboxFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={inputId}
        type="checkbox"
        aria-describedby={hint ? `${inputId}-hint` : undefined}
        className="mt-0.5 h-5 w-5 shrink-0 rounded border-border-soft accent-primary-dark"
        {...props}
      />
      <div>
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
        {hint && (
          <p id={`${inputId}-hint`} className="mt-0.5 text-xs leading-relaxed text-ink-soft">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

/** Password input with a button to show what was typed. */
export function PasswordField({ label, error, hint, id, className, required, ...props }: TextFieldProps) {
  const { inputId, describedBy } = useFieldIds(id, hint, error);
  const [visible, setVisible] = useState(false);

  return (
    <FieldShell inputId={inputId} label={label} error={error} hint={hint} className={className}>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(INPUT_CLASSES, "pr-12", error ? "border-red-400" : "border-border-soft")}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 mt-1 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-btn text-ink-soft transition-colors hover:bg-surface-alt hover:text-primary-dark"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </FieldShell>
  );
}
