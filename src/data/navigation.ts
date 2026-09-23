export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Accueil", href: "/" },
  { label: "Notre école", href: "/notre-ecole" },
  { label: "Maternelle", href: "/maternelle" },
  { label: "Primaire", href: "/primaire" },
  { label: "Vie scolaire", href: "/vie-scolaire" },
  { label: "Galerie", href: "/galerie" },
  { label: "Actualités", href: "/actualites" },
];
