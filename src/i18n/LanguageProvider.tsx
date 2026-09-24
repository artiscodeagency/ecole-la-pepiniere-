import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import {
  LanguageContext,
  type LanguageContextValue,
  type Translate,
} from "@/i18n/context";
import { DEFAULT_LANG, LANGUAGES, type Lang } from "@/i18n/types";

const STORAGE_KEY = "pepiniere-lang";

const OG_LOCALES: Record<Lang, string> = { fr: "fr_CM", en: "en_CM" };

function readStoredLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES.includes(stored as Lang)) return stored as Lang;
  } catch {
    // Storage can be unavailable (private mode, blocked cookies): fall back.
  }
  return DEFAULT_LANG;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The choice still applies for this visit.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute("content", OG_LOCALES[lang]);
  }, [lang]);

  const t = useMemo<Translate>(
    () =>
      ((text: Parameters<Translate>[0] | string, en?: string) =>
        typeof text === "string" ? (lang === "fr" ? text : (en ?? text)) : text[lang]) as Translate,
    [lang],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t }),
    [lang, setLang, t],
  );

  return <LanguageContext value={value}>{children}</LanguageContext>;
}
