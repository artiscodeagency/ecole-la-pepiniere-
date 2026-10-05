/**
 * Admin pages, relative to /admin. The login and reset paths are also used
 * by the API in its emails (backend/config/pepiniere.php).
 */
export const PATHS = {
  home: "/",
  login: "/connexion",
  forgotPassword: "/mot-de-passe/oublie",
  resetPassword: "/mot-de-passe/reinitialiser",
  news: "/actualites",
  announcements: "/annonces",
  events: "/evenements",
  gallery: "/galerie",
  documents: "/documents",
  messages: "/messages",
  admissions: "/inscriptions",
  schoolInfo: "/ecole",
  users: "/utilisateurs",
  profile: "/profil",
} as const;
