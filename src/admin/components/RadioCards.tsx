import { cn } from "@/lib/utils";

export interface RadioCardOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface RadioCardsProps<T extends string> {
  name: string;
  legend: string;
  /** Shown above the options; otherwise the legend is only read by screen readers. */
  showLegend?: boolean;
  value: T;
  options: RadioCardOption<T>[];
  onChange: (value: T) => void;
}

/** A choice between a few options, each with a short explanation. */
export function RadioCards<T extends string>({ name, legend, showLegend = false, value, options, onChange }: RadioCardsProps<T>) {
  return (
    <fieldset className="space-y-2">
      <legend className={showLegend ? "mb-2 text-sm font-medium text-ink" : "sr-only"}>{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-btn border p-3 transition-colors",
            value === option.value ? "border-primary bg-primary-light/60" : "border-border-soft hover:bg-surface-alt",
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="mt-1 accent-primary-dark"
          />
          <span>
            <span className="block text-sm font-semibold text-ink">{option.label}</span>
            {option.description && <span className="block text-xs text-ink-soft">{option.description}</span>}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
