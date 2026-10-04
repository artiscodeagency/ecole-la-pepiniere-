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

export const ROLE_LABELS: Record<Role, string> = {
  director: "Directeur",
  assistant: "Assistante",
};
