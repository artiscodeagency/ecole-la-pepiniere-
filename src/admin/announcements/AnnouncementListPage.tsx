import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Pin, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { type AdminAnnouncement, ANNOUNCEMENTS_QUERY_KEY, DISPLAY_STATUS, IMPORTANCE } from "@/admin/announcements/types";
import { useAuth } from "@/admin/auth/useAuth";
import { Button, ButtonLink } from "@/admin/components/Button";
import { EmptyState } from "@/admin/components/EmptyState";
import { FormAlert } from "@/admin/components/FormAlert";
import { FilterPills, FilterSelect, SearchBar } from "@/admin/components/ListFilters";
import { PageHeader } from "@/admin/components/PageHeader";
import { Pagination } from "@/admin/components/Pagination";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { formatDateTime } from "@/admin/lib/dates";
import { useDebouncedValue } from "@/admin/lib/useDebouncedValue";
import { useListParams } from "@/admin/lib/useListParams";
import { useSections } from "@/admin/lib/useSections";
import { announcementEditPath, PATHS } from "@/admin/paths";
import type { Paginated } from "@/admin/types";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/lib/usePageMeta";
import { NOUNS, restoredMessage } from "@/admin/toast/messages";

const FILTERS = [
  { value: "", label: "Toutes" },
  { value: "active", label: "En ligne" },
  { value: "scheduled", label: "Programmées" },
  { value: "draft", label: "Brouillons" },
  { value: "expired", label: "Expirées" },
  { value: "archived", label: "Archivées" },
] as const;

function AnnouncementRow({
  announcement,
  onRestore,
  restoring,
}: {
  announcement: AdminAnnouncement;
  onRestore?: () => void;
  restoring?: boolean;
}) {
  const status = DISPLAY_STATUS[announcement.display_status];
  const importance = IMPORTANCE[announcement.importance];

  const content = (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        <StatusBadge tone={importance.tone}>{importance.label}</StatusBadge>
        {announcement.is_pinned && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft">
            <Pin size={13} aria-hidden="true" />
            Épinglée
          </span>
        )}
        {!announcement.title.en && <span className="text-xs text-ink-soft">Français seulement</span>}
      </div>
      <p className="mt-1.5 truncate font-semibold text-ink">{announcement.title.fr}</p>
      <p className="mt-0.5 truncate text-sm text-ink-soft">
        {announcement.section?.name.fr ?? "Toute l'école"} · du {formatDateTime(announcement.starts_at)} au{" "}
        {formatDateTime(announcement.ends_at)}
      </p>
    </div>
  );

  if (announcement.deleted_at) {
    return (
      <li className="flex items-center gap-4 rounded-card border border-border-soft bg-white p-4 shadow-soft">
        {content}
        {onRestore && (
          <Button onClick={onRestore} pending={restoring}>
            <RotateCcw size={16} aria-hidden="true" />
            Restaurer
          </Button>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        to={announcementEditPath(announcement.id)}
        className="flex items-center gap-4 rounded-card border border-border-soft bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft-lg"
      >
        {content}
      </Link>
    </li>
  );
}

export function AnnouncementListPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const params = useListParams();
  const status = params.get("statut");
  const section = params.get("section");
  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim());
  const sections = useSections();

  usePageMeta("Annonces | Administration La Pépinière", "Gestion des annonces.");

  const query = new URLSearchParams();
  if (status) query.set("status", status === "corbeille" ? "trashed" : status);
  if (section) query.set("section", section);
  if (searchTerm) query.set("q", searchTerm);
  if (params.page > 1) query.set("page", String(params.page));

  const announcements = useQuery({
    queryKey: [...ANNOUNCEMENTS_QUERY_KEY, "list", query.toString()],
    queryFn: () => api<Paginated<AdminAnnouncement>>(`/admin/announcements?${query}`),
    placeholderData: keepPreviousData,
  });

  const restore = useMutation({
    meta: { success: restoredMessage(NOUNS.announcement) },
    mutationFn: (id: number) => api(`/admin/announcements/${id}/restore`, { method: "POST" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const filters = user?.role === "director" ? [...FILTERS, { value: "corbeille", label: "Corbeille" }] : FILTERS;
  const filtered = Boolean(status || section || searchTerm);

  return (
    <div>
      <PageHeader
        title="Annonces"
        description="Messages courts et datés pour les familles : réunions, fermetures, rappels…"
        actions={
          <ButtonLink to={PATHS.announcementsNew} variant="primary">
            <Plus size={17} aria-hidden="true" />
            Nouvelle annonce
          </ButtonLink>
        }
      />

      <FilterPills label="Filtrer par statut" options={filters} value={status} onChange={(value) => params.update({ statut: value })} />

      <SearchBar
        label="Rechercher une annonce"
        value={search}
        onChange={(value) => {
          setSearch(value);
          if (params.page > 1) params.update({});
        }}
        placeholder="Rechercher par titre…"
        aside={
          <FilterSelect label="Section" value={section} onChange={(value) => params.update({ section: value })}>
            <option value="">Toutes les sections</option>
            <option value="ecole">Toute l'école</option>
            {sections.data?.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name.fr}
              </option>
            ))}
          </FilterSelect>
        }
      />

      {restore.isError && (
        <div className="mb-4">
          <FormAlert tone="error">{restore.error.message}</FormAlert>
        </div>
      )}

      {announcements.isError ? (
        <div className="space-y-4">
          <FormAlert tone="error">{announcements.error.message}</FormAlert>
          <Button onClick={() => void announcements.refetch()}>Réessayer</Button>
        </div>
      ) : announcements.isPending ? (
        <ul className="space-y-3" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <li key={index} className="h-22 animate-pulse rounded-card border border-border-soft bg-white" />
          ))}
        </ul>
      ) : announcements.data.data.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={filtered ? "Aucune annonce ne correspond à ces filtres." : "Aucune annonce pour le moment."}
          description={
            filtered ? undefined : "Une annonce s'affiche sur le site pendant la période choisie, puis disparaît d'elle-même."
          }
          action={
            !filtered && (
              <ButtonLink to={PATHS.announcementsNew} variant="primary">
                <Plus size={17} aria-hidden="true" />
                Créer la première annonce
              </ButtonLink>
            )
          }
        />
      ) : (
        <>
          <ul className={cn("space-y-3", announcements.isPlaceholderData && "opacity-60")}>
            {announcements.data.data.map((item) => (
              <AnnouncementRow
                key={item.id}
                announcement={item}
                onRestore={item.can.restore ? () => restore.mutate(item.id) : undefined}
                restoring={restore.isPending && restore.variables === item.id}
              />
            ))}
          </ul>
          <Pagination meta={announcements.data.meta} onPageChange={(next) => params.update({ page: String(next) })} />
        </>
      )}
    </div>
  );
}
