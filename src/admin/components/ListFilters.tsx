import { Search } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FilterPillsProps {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

/** One-click status filters above a list. */
export function FilterPills({ label, options, value, onChange }: FilterPillsProps) {
  return (
    <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === option.value
              ? "border-primary-dark bg-primary-dark text-white"
              : "border-border-soft bg-white text-ink-soft hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface SearchBarProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** A select or other filter shown next to the search field. */
  aside?: ReactNode;
}

export function SearchBar({ label, value, onChange, placeholder, aside }: SearchBarProps) {
  return (
    <div className={cn("mb-6 grid gap-3", aside && "sm:grid-cols-[1fr_16rem]")}>
      <label className="relative block">
        <span className="sr-only">{label}</span>
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-btn border border-border-soft bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>
      {aside}
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

export function FilterSelect({ label, value, onChange, children }: FilterSelectProps) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-btn border border-border-soft bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      >
        {children}
      </select>
    </label>
  );
}
