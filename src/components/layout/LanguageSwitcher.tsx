import { useLanguage } from "@/i18n/useLanguage";
import { LANGUAGES, type Lang } from "@/i18n/types";
import { cn } from "@/lib/utils";

const OPTIONS: Record<Lang, { short: string; name: string }> = {
  fr: { short: "FR", name: "Français" },
  en: { short: "EN", name: "English" },
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("Choisir la langue", "Choose language")}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-border-soft bg-surface-alt p-0.5",
        className,
      )}
    >
      {LANGUAGES.map((code) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={active}
            aria-label={OPTIONS[code].name}
            title={OPTIONS[code].name}
            onClick={() => setLang(code)}
            className={cn(
              "h-7 min-w-9 rounded-full px-2.5 text-xs font-semibold tracking-wide transition-colors duration-200",
              active
                ? "bg-primary text-white shadow-soft"
                : "text-ink-soft hover:text-primary",
            )}
          >
            {OPTIONS[code].short}
          </button>
        );
      })}
    </div>
  );
}
