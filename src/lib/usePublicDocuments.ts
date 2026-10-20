import { useEffect, useState } from "react";

import { api } from "@/lib/api/client";

export type PublicDocumentType = "internal_rules" | "school_calendar" | "supplies_list" | "other";

export interface PublicDocument {
  id: number;
  title: { fr: string; en: string | null };
  description: { fr: string | null; en: string | null };
  type: PublicDocumentType;
  url: string;
  size_bytes: number;
}

/**
 * The documents published by the school, newest first. Empty while loading
 * or when the server cannot be reached: the page keeps its own text then.
 */
export function usePublicDocuments(): PublicDocument[] {
  const [documents, setDocuments] = useState<PublicDocument[]>([]);

  useEffect(() => {
    let active = true;
    api<{ data: PublicDocument[] }>("/public/documents")
      .then(({ data }) => {
        if (active) setDocuments(data);
      })
      .catch(() => {
        // Nothing to show: the "document to be added" text stays.
      });
    return () => {
      active = false;
    };
  }, []);

  return documents;
}
