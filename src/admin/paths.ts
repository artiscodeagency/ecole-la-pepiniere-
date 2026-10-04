/**
 * Admin pages, relative to /admin. The login and reset paths are also used
 * by the API in its emails (backend/config/pepiniere.php).
 */
export const PATHS = {
  home: "/",
  login: "/connexion",
  forgotPassword: "/mot-de-passe/oublie",
  resetPassword: "/mot-de-passe/reinitialiser",
} as const;
