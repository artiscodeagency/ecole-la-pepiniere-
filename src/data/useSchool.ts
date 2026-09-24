import { SCHOOL, type School } from "@/data/school";
import { useLanguage } from "@/i18n/useLanguage";

/** School content in the language currently selected by the visitor. */
export function useSchool(): School {
  const { lang } = useLanguage();
  return SCHOOL[lang];
}
