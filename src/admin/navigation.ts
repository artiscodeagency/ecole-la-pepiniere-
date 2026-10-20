import {
  CalendarDays,
  ClipboardList,
  FileText,
  Images,
  LayoutDashboard,
  type LucideIcon,
  Mail,
  Megaphone,
  Newspaper,
  School,
  Users,
} from "lucide-react";

import { PATHS } from "@/admin/paths";
import type { Ability, AdminUser } from "@/admin/types";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Hidden for users without this permission (the server refuses them anyway). */
  ability?: Ability;
  /** False until the module is built: shown greyed out. */
  available: boolean;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const NAVIGATION: NavGroup[] = [
  {
    items: [{ label: "Tableau de bord", path: PATHS.home, icon: LayoutDashboard, available: true }],
  },
  {
    title: "Contenus du site",
    items: [
      { label: "Actualités", path: PATHS.news, icon: Newspaper, available: true },
      { label: "Annonces", path: PATHS.announcements, icon: Megaphone, available: true },
      { label: "Événements", path: PATHS.events, icon: CalendarDays, available: true },
      { label: "Galerie", path: PATHS.gallery, icon: Images, available: true },
      { label: "Documents", path: PATHS.documents, icon: FileText, available: true },
    ],
  },
  {
    title: "Demandes reçues",
    items: [
      { label: "Messages", path: PATHS.messages, icon: Mail, available: true },
      { label: "Demandes d'inscription", path: PATHS.admissions, icon: ClipboardList, available: true },
    ],
  },
  {
    title: "Établissement",
    items: [
      {
        label: "Informations de l'école",
        path: PATHS.schoolInfo,
        icon: School,
        ability: "manage-school-info",
        available: true,
      },
      { label: "Utilisateurs", path: PATHS.users, icon: Users, ability: "manage-users", available: false },
    ],
  },
];

/** The navigation this user may see; empty groups are left out. */
export function navigationFor(user: AdminUser): NavGroup[] {
  return NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.ability || user.abilities[item.ability]),
  })).filter((group) => group.items.length > 0);
}

export function findNavItem(path: string): NavItem | undefined {
  return NAVIGATION.flatMap((group) => group.items).find((item) => item.path === path);
}
