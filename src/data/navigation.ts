import { type Localized, tr } from "@/i18n/types";

export interface NavLink {
  label: Localized;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: tr("Accueil", "Home"), href: "/" },
  { label: tr("Notre école", "Our school"), href: "/notre-ecole" },
  { label: tr("Maternelle", "Nursery"), href: "/maternelle" },
  { label: tr("Primaire", "Primary"), href: "/primaire" },
  { label: tr("Vie scolaire", "School life"), href: "/vie-scolaire" },
  { label: tr("Galerie", "Gallery"), href: "/galerie" },
  { label: tr("Actualités", "News"), href: "/actualites" },
];
