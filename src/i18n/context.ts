import { createContext } from "react";

import type { Lang, Localized } from "@/i18n/types";

/**
 * Picks the text for the current language.
 * - `t({ fr, en })` for a `Localized` value (data files, module-level constants)
 * - `t("français", "english")` for inline text
 */
export interface Translate {
  (text: Localized): string;
  (fr: string, en: string): string;
}

export interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translate;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
