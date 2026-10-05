export type Role = "director" | "assistant";

/** Permissions sent by the API, for the interface only: the server checks every request. */
export type Ability =
  | "manage-content"
  | "delete-inbox-items"
  | "manage-school-info"
  | "manage-users"
  | "view-activity-log";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  last_login_at: string | null;
  abilities: Record<Ability, boolean>;
}

/** A bilingual text from the API; a missing English text is null. */
export interface Localized {
  fr: string | null;
  en: string | null;
}

export interface Category {
  id: number;
  slug: string;
  name: Localized;
}

/** An uploaded image, with the URL of each stored version. */
export interface Media {
  id: number;
  kind: "image" | "document";
  urls: Partial<Record<"original" | "thumb" | "medium" | "large" | "og", string>>;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt: Localized;
}

/** A page of a list, as returned by Laravel. */
export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

export const ROLE_LABELS: Record<Role, string> = {
  director: "Directeur",
  assistant: "Assistante",
};
