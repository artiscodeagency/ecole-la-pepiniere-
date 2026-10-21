import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Images,
  type LucideIcon,
  Mail,
  Megaphone,
  Newspaper,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/admin/auth/useAuth";
import { FormAlert } from "@/admin/components/FormAlert";
import { findNavItem } from "@/admin/navigation";
import { PATHS } from "@/admin/paths";
import { type DashboardStats, useDashboardStats } from "@/admin/lib/useDashboardStats";
import { ROLE_LABELS } from "@/admin/types";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/lib/usePageMeta";

interface StatDefinition {
  key: keyof DashboardStats;
  label: string;
  icon: LucideIcon;
  path: string;
  /** Shown instead of the label when there is nothing to handle. */
  emptyLabel?: string;
}

const TO_HANDLE: StatDefinition[] = [
  { key: "messages_unread", label: "Messages non lus", icon: Mail, path: PATHS.messages, emptyLabel: "Aucun nouveau message" },
  {
    key: "admission_requests_new",
    label: "Nouvelles demandes d'inscription",
    icon: ClipboardList,
    path: PATHS.admissions,
    emptyLabel: "Aucune nouvelle demande",
  },
];

const ON_THE_SITE: StatDefinition[] = [
  { key: "news_published", label: "Actualités publiées", icon: Newspaper, path: PATHS.news },
  { key: "announcements_active", label: "Annonces actives", icon: Megaphone, path: PATHS.announcements },
  { key: "events_upcoming", label: "Événements à venir", icon: CalendarDays, path: PATHS.events },
  { key: "gallery_photos", label: "Photos dans la galerie", icon: Images, path: PATHS.gallery },
];

const numberFormat = new Intl.NumberFormat("fr-FR");

function todayLabel() {
  const label = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Douala",
  }).format(new Date());
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function StatCard({ stat, value, urgent = false }: { stat: StatDefinition; value: number; urgent?: boolean }) {
  const Icon = stat.icon;
  const module = findNavItem(stat.path);
  const nothingToHandle = stat.emptyLabel !== undefined && value === 0;

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full",
            urgent && value > 0 ? "bg-primary-dark text-white" : "bg-primary-light text-primary-dark",
          )}
        >
          <Icon size={20} aria-hidden="true" />
        </span>
        {module?.available && (
          <ArrowRight
            size={18}
            aria-hidden="true"
            className="text-ink-soft transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary-dark"
          />
        )}
      </div>
      <p className="mt-5 text-3xl font-bold text-ink">{numberFormat.format(value)}</p>
      <p className="mt-1 text-sm font-medium text-ink-soft">{nothingToHandle ? stat.emptyLabel : stat.label}</p>
    </>
  );

  const classes = cn(
    "group block rounded-card border bg-white p-5 shadow-soft",
    urgent && value > 0 ? "border-primary/50" : "border-border-soft",
  );

  return module?.available ? (
    <Link to={stat.path} className={cn(classes, "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-lg")}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}

function StatSkeleton() {
  return (
    <div className="rounded-card border border-border-soft bg-white p-5 shadow-soft" aria-hidden="true">
      <div className="h-11 w-11 animate-pulse rounded-full bg-surface-alt" />
      <div className="mt-5 h-8 w-16 animate-pulse rounded bg-surface-alt" />
      <div className="mt-2 h-4 w-32 animate-pulse rounded bg-surface-alt" />
    </div>
  );
}

interface StatSectionProps {
  id: string;
  title: string;
  stats: StatDefinition[];
  data: DashboardStats | undefined;
  urgent?: boolean;
  className?: string;
}

function StatSection({ id, title, stats, data, urgent = false, className }: StatSectionProps) {
  return (
    <section className={className} aria-labelledby={id}>
      <h2 id={id} className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">
        {title}
      </h2>
      <div className={cn("mt-4 grid gap-4", stats.length > 2 ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2")}>
        {stats.map((stat) =>
          data ? (
            <StatCard key={stat.key} stat={stat} value={data[stat.key]} urgent={urgent} />
          ) : (
            <StatSkeleton key={stat.key} />
          ),
        )}
      </div>
    </section>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const dashboard = useDashboardStats();

  usePageMeta("Tableau de bord | Administration La Pépinière", "Espace d'administration de La Pépinière.");

  if (!user) return null;

  return (
    <div>
      <p className="text-sm text-ink-soft">{todayLabel()}</p>
      <h1 className="mt-1 text-3xl font-bold text-ink">Bienvenue, {user.name}</h1>
      <p className="mt-1 text-sm font-medium text-primary-dark">{ROLE_LABELS[user.role]}</p>

      {dashboard.isError ? (
        <div className="mt-8 max-w-xl space-y-4">
          <FormAlert tone="error">{dashboard.error.message}</FormAlert>
          <button
            type="button"
            onClick={() => void dashboard.refetch()}
            className="rounded-btn bg-primary-dark px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-ink"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          <StatSection id="a-traiter" title="À traiter" stats={TO_HANDLE} data={dashboard.data} urgent className="mt-8" />
          <StatSection id="sur-le-site" title="En ligne sur le site" stats={ON_THE_SITE} data={dashboard.data} className="mt-10" />
        </>
      )}
    </div>
  );
}
