export type Lang = "fr" | "en";

export const LANGUAGES: readonly Lang[] = ["fr", "en"];

export const DEFAULT_LANG: Lang = "fr";

/** A text available in every supported language. */
export type Localized = Readonly<Record<Lang, string>>;

/** Builds a `Localized` text: `tr("Bonjour", "Hello")`. */
export const tr = (fr: string, en: string): Localized => ({ fr, en });
