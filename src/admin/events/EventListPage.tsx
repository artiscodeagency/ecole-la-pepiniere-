import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ImageIcon, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/admin/auth/useAuth";
import { Button, ButtonLink } from "@/admin/components/Button";
import { EmptyState } from "@/admin/components/EmptyState";
import { FormAlert } from "@/admin/components/FormAlert";
import { FilterPills, FilterSelect, SearchBar } from "@/admin/components/ListFilters";
import { PageHeader } from "@/admin/components/PageHeader";
import { Pagination } from "@/admin/components/Pagination";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { type AdminEvent, DISPLAY_STATUS, EVENTS_QUERY_KEY, formatEventWhen } from "@/admin/events/types";
import { useDebouncedValue } from "@/admin/lib/useDebouncedValue";
import { useListParams } from "@/admin/lib/useListParams";
import { useSections } from "@/admin/lib/useSections";
import { eventEditPath, PATHS } from "@/admin/paths";
import type { Paginated } from "@/admin/types";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/lib/usePageMeta";

const FILTERS = [
  { value: "", label: "Tous" },
  { value: "upcoming", label: "À venir" },
  { value: "past", label: "Passés" },
  { value: "draft", label: "Brouillons" },
  { value: "cancelled", label: "Annulés" },
  { value: "archived", label: "Archivés" },
] as const;

function EventRow({ event, onRestore, restoring }: { event: AdminEvent; onRestore?: () => void; restoring?: boolean }) {
  const status = DISPLAY_STATUS[event.display_status];
  const thumbnail = event.image?.urls.thumb;

  const content = (
    <>
      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-surface-alt">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-ink-soft/50">
            <ImageIcon size={22} aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
          {!event.title.en && <span className="text-xs text-ink-soft">Français seulement</span>}
        </div>
        <p className="mt-1.5 truncate font-semibold text-ink">{event.title.fr}</p>
        <p className="mt-0.5 truncate text-sm text-ink-soft">
          {[formatEventWhen(event), event.location.fr, event.section?.name.fr ?? "Toute l'école"].filter(Boolean).join(" · ")}
        </p>
      </div>
    </>
  );

  if (event.deleted_at) {
    return (
      <li className="flex items-center gap-4 rounded-card border border-border-soft bg-white p-3 shadow-soft">
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
        to={eventEditPath(event.id)}
        className="flex items-center gap-4 rounded-card border border-border-soft bg-white p-3 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft-lg"
      >
        {content}
      </Link>
    </li>
  );
}

export function EventListPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const params = useListParams();
  const status = params.get("statut");
  const section = params.get("section");
  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim());
  const sections = useSections();

  usePageMeta("Événements | Administration La Pépinière", "Gestion des événements.");

  const query = new URLSearchParams();
  if (status) query.set("status", status === "corbeille" ? "trashed" : status);
  if (section) query.set("section", section);
  if (searchTerm) query.set("q", searchTerm);
  if (params.page > 1) query.set("page", String(params.page));

  const events = useQuery({
    queryKey: [...EVENTS_QUERY_KEY, "list", query.toString()],
    queryFn: () => api<Paginated<AdminEvent>>(`/admin/events?${query}`),
    placeholderData: keepPreviousData,
  });

  const restore = useMutation({
    mutationFn: (id: number) => api(`/admin/events/${id}/restore`, { method: "POST" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const filters = user?.role === "director" ? [...FILTERS, { value: "corbeille", label: "Corbeille" }] : FILTERS;
  const filtered = Boolean(status || section || searchTerm);

  return (
    <div>
      <PageHeader
        title="Événements"
        description="L'agenda de l'école : sorties, journées portes ouvertes, fêtes, réunions…"
        actions={
          <ButtonLink to={PATHS.eventsNew} variant="primary">
            <Plus size={17} aria-hidden="true" />
            Nouvel événement
          </ButtonLink>
        }
      />

      <FilterPills label="Filtrer par statut" options={filters} value={status} onChange={(value) => params.update({ statut: value })} />

      <SearchBar
        label="Rechercher un événement"
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

      {events.isError ? (
        <div className="space-y-4">
          <FormAlert tone="error">{events.error.message}</FormAlert>
          <Button onClick={() => void events.refetch()}>Réessayer</Button>
        </div>
      ) : events.isPending ? (
        <ul className="space-y-3" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <li key={index} className="h-22 animate-pulse rounded-card border border-border-soft bg-white" />
          ))}
        </ul>
      ) : events.data.data.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={filtered ? "Aucun événement ne correspond à ces filtres." : "Aucun événement pour le moment."}
          description={filtered ? undefined : "Les événements publiés formeront l'agenda de l'école sur le site."}
          action={
            !filtered && (
              <ButtonLink to={PATHS.eventsNew} variant="primary">
                <Plus size={17} aria-hidden="true" />
                Ajouter le premier événement
              </ButtonLink>
            )
          }
        />
      ) : (
        <>
          <ul className={cn("space-y-3", events.isPlaceholderData && "opacity-60")}>
            {events.data.data.map((item) => (
              <EventRow
                key={item.id}
                event={item}
                onRestore={item.can.restore ? () => restore.mutate(item.id) : undefined}
                restoring={restore.isPending && restore.variables === item.id}
              />
            ))}
          </ul>
          <Pagination meta={events.data.meta} onPageChange={(next) => params.update({ page: String(next) })} />
        </>
      )}
    </div>
  );
}
