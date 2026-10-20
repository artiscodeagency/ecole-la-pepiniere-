import type { Localized } from "@/admin/types";

export type DocumentType = "internal_rules" | "school_calendar" | "supplies_list" | "other";

export interface AdminDocument {
  id: number;
  title: Localized;
  description: Localized;
  type: DocumentType;
  is_public: boolean;
  file: { url: string; name: string | null; size_bytes: number };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  can: { delete: boolean; restore: boolean };
}

/** Labels in both languages: the French one is shown in the admin, both prefill a new document's title. */
export const DOCUMENT_TYPES: Record<DocumentType, { fr: string; en: string; description: string }> = {
  internal_rules: {
    fr: "Règlement intérieur",
    en: "Internal regulations",
    description: "Affiché dans la rubrique « Informations aux parents » de la page Vie scolaire.",
  },
  school_calendar: {
    fr: "Calendrier scolaire",
    en: "School calendar",
    description: "Affiché dans la rubrique « Informations aux parents » de la page Vie scolaire.",
  },
  supplies_list: { fr: "Liste des fournitures", en: "School supplies list", description: "Liste à télécharger par les parents." },
  other: { fr: "Autre document", en: "Other document", description: "Tout autre document utile aux familles." },
};

export const DOCUMENTS_QUERY_KEY = ["admin", "documents"] as const;

/** "1,2 Mo" or "340 Ko" */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
  return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}
