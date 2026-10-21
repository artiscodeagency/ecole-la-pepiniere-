import { useCallback } from "react";

import { useLanguage } from "@/i18n/useLanguage";
import type { ApiText } from "@/lib/api/publicNews";

/**
 * Picks the text of the current language from an API value. A missing
 * English text shows the French one: the site never shows "undefined".
 */
export function useApiText() {
  const { lang } = useLanguage();
  return useCallback((text: ApiText | null | undefined) => (lang === "en" ? (text?.en ?? text?.fr) : text?.fr) ?? "", [lang]);
}

/** "12 octobre 2026" / "12 October 2026" */
export function useLongDate() {
  const { lang } = useLanguage();
  return useCallback(
    (iso: string) => new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", { dateStyle: "long" }).format(new Date(iso)),
    [lang],
  );
}
