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
  newsNew: "/actualites/nouvelle",
  announcements: "/annonces",
  announcementsNew: "/annonces/nouvelle",
  events: "/evenements",
  eventsNew: "/evenements/nouveau",
  gallery: "/galerie",
  documents: "/documents",
  messages: "/messages",
  admissions: "/inscriptions",
  schoolInfo: "/ecole",
  users: "/utilisateurs",
  profile: "/profil",
} as const;

export const newsEditPath = (id: number) => `${PATHS.news}/${id}`;
export const announcementEditPath = (id: number) => `${PATHS.announcements}/${id}`;
export const eventEditPath = (id: number) => `${PATHS.events}/${id}`;
