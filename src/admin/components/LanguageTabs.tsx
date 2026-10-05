import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ContentLang = "fr" | "en";

interface LanguageTabsProps {
  active: ContentLang;
  onChange: (lang: ContentLang) => void;
  /** Languages that have validation errors get a red mark. */
  withErrors?: Partial<Record<ContentLang, boolean>>;
  /** Both panels stay mounted, so an editor keeps its state when switching. */
  fr: ReactNode;
  en: ReactNode;
}

const LABELS: Record<ContentLang, string> = { fr: "Français", en: "English" };

export function LanguageTabs({ active, onChange, withErrors = {}, fr, en }: LanguageTabsProps) {
  return (
    <div>
      <div role="tablist" aria-label="Langue du contenu" className="flex gap-1 border-b border-border-soft">
        {(["fr", "en"] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            role="tab"
            id={`tab-${lang}`}
            aria-selected={active === lang}
            aria-controls={`panel-${lang}`}
            onClick={() => onChange(lang)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active === lang ? "border-primary-dark text-primary-dark" : "border-transparent text-ink-soft hover:text-ink",
            )}
          >
            {LABELS[lang]}
            {lang === "en" && <span className="text-xs font-normal text-ink-soft">(facultatif)</span>}
            {withErrors[lang] && <span className="h-2 w-2 rounded-full bg-red-600" aria-label="contient des erreurs" />}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="panel-fr" aria-labelledby="tab-fr" hidden={active !== "fr"} className="pt-5">
        {fr}
      </div>
      <div role="tabpanel" id="panel-en" aria-labelledby="tab-en" hidden={active !== "en"} className="pt-5">
        {en}
      </div>
    </div>
  );
}
