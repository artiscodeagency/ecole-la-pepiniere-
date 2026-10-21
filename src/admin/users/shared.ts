import type { RadioCardOption } from "@/admin/components/RadioCards";
import type { Role } from "@/admin/types";

export const USERS_QUERY_KEY = ["admin", "users"] as const;

/** Same rule as the server (config pepiniere.passwords): 10 characters, letters and numbers. */
export const PASSWORD_HINT = "Au moins 10 caractères, avec des lettres et des chiffres.";
export const PASSWORD_MIN_LENGTH = 10;

export const ROLE_OPTIONS: RadioCardOption<Role>[] = [
  {
    value: "assistant",
    label: "Assistante",
    description: "Contenus du site, messages, demandes d'inscription et documents.",
  },
  {
    value: "director",
    label: "Directeur",
    description: "Tout, y compris les informations de l'école et les comptes.",
  },
];
