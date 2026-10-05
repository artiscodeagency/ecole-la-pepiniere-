import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Newspaper, Plus, RotateCcw, Search, Star } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useAuth } from "@/admin/auth/useAuth";
import { Button, ButtonLink } from "@/admin/components/Button";
import { EmptyState } from "@/admin/components/EmptyState";
import { FormAlert } from "@/admin/components/FormAlert";
import { PageHeader } from "@/admin/components/PageHeader";
import { Pagination } from "@/admin/components/Pagination";
import { formatDate } from "@/admin/lib/dates";
import { useDebouncedValue } from "@/admin/lib/useDebouncedValue";
import { NewsStatusBadge } from "@/admin/news/NewsStatusBadge";
import { type AdminNews, NEWS_QUERY_KEY } from "@/admin/news/types";
import { useNewsCategories } from "@/admin/news/useNewsCategories";
import { newsEditPath, PATHS } from "@/admin/paths";
import type { Paginated } from "@/admin/types";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/lib/usePageMeta";

const FILTERS = [
  { value: "", label: "Toutes" },
  { value: "draft", label: "Brouillons" },
  { value: "published", label: "Publiées" },
  { value: "scheduled", label: "Programmées" },
  { value: "archived", label: "Archivées" },
] as const;

function NewsRow({ news, onRestore, restoring }: { news: AdminNews; onRestore?: () => void; restoring?: boolean }) {
  const thumbnail = news.cover?.urls.thumb;
  const date = news.published_at ?? news.updated_at;

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
          <NewsStatusBadge news={news} />
          {news.is_featured && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft">
              <Star size={13} className="fill-accent-yellow text-accent-yellow" aria-hidden="true" />
              Mise en avant
            </span>
          )}
          {!news.title.en && <span className="text-xs text-ink-soft">Français seulement</span>}
        </div>
        <p className="mt-1.5 truncate font-semibold text-ink">{news.title.fr}</p>
        <p className="mt-0.5 truncate text-sm text-ink-soft">
          {[news.category?.name.fr, news.author?.name, date && `${news.published_at ? "Publication" : "Modifiée"} : ${formatDate(date)}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </>
  );

  if (news.deleted_at) {
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
        to={newsEditPath(news.id)}
        className="flex items-center gap-4 rounded-card border border-border-soft bg-white p-3 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft-lg"
      >
        {content}
      </Link>
    </li>
  );
}

export function NewsListPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const status = params.get("statut") ?? "";
  const category = params.get("categorie") ?? "";
  const page = Number(params.get("page") ?? "1") || 1;
  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim());
  const categories = useNewsCategories();
  const isDirector = user?.role === "director";

  usePageMeta("Actualités | Administration La Pépinière", "Gestion des actualités.");

  const updateParams = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!("page" in changes)) next.delete("page");
    setParams(next, { replace: true });
  };

  const query = new URLSearchParams();
  if (status) query.set("status", status === "corbeille" ? "trashed" : status);
  if (category) query.set("category", category);
  if (searchTerm) query.set("q", searchTerm);
  if (page > 1) query.set("page", String(page));

  const news = useQuery({
    queryKey: [...NEWS_QUERY_KEY, "list", query.toString()],
    queryFn: () => api<Paginated<AdminNews>>(`/admin/news?${query}`),
    placeholderData: keepPreviousData,
  });

  const restore = useMutation({
    mutationFn: (id: number) => api(`/admin/news/${id}/restore`, { method: "POST" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const filters = isDirector ? [...FILTERS, { value: "corbeille", label: "Corbeille" }] : FILTERS;
  const filtered = Boolean(status || category || searchTerm);

  return (
    <div>
      <PageHeader
        title="Actualités"
        description="Rédigez les actualités de l'école et choisissez quand elles paraissent sur le site."
        actions={
          <ButtonLink to={PATHS.newsNew} variant="primary">
            <Plus size={17} aria-hidden="true" />
            Nouvelle actualité
          </ButtonLink>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filtrer par statut">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            aria-pressed={status === filter.value}
            onClick={() => updateParams({ statut: filter.value })}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              status === filter.value
                ? "border-primary-dark bg-primary-dark text-white"
                : "border-border-soft bg-white text-ink-soft hover:text-ink",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_16rem]">
        <label className="relative block">
          <span className="sr-only">Rechercher une actualité</span>
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              // A new search starts again from the first page.
              if (page > 1) updateParams({});
            }}
            placeholder="Rechercher par titre…"
            className="w-full rounded-btn border border-border-soft bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>
        <label className="block">
          <span className="sr-only">Catégorie</span>
          <select
            value={category}
            onChange={(event) => updateParams({ categorie: event.target.value })}
            className="w-full rounded-btn border border-border-soft bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">Toutes les catégories</option>
            {categories.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name.fr}
              </option>
            ))}
          </select>
        </label>
      </div>

      {restore.isError && (
        <div className="mb-4">
          <FormAlert tone="error">{restore.error.message}</FormAlert>
        </div>
      )}

      {news.isError ? (
        <div className="space-y-4">
          <FormAlert tone="error">{news.error.message}</FormAlert>
          <Button onClick={() => void news.refetch()}>Réessayer</Button>
        </div>
      ) : news.isPending ? (
        <ul className="space-y-3" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <li key={index} className="h-22 animate-pulse rounded-card border border-border-soft bg-white" />
          ))}
        </ul>
      ) : news.data.data.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title={filtered ? "Aucune actualité ne correspond à ces filtres." : "Aucune actualité pour le moment."}
          description={filtered ? undefined : "Les actualités publiées ici apparaîtront sur la page Actualités du site."}
          action={
            !filtered && (
              <ButtonLink to={PATHS.newsNew} variant="primary">
                <Plus size={17} aria-hidden="true" />
                Écrire la première actualité
              </ButtonLink>
            )
          }
        />
      ) : (
        <>
          <ul className={cn("space-y-3", news.isPlaceholderData && "opacity-60")}>
            {news.data.data.map((item) => (
              <NewsRow
                key={item.id}
                news={item}
                onRestore={item.can.restore ? () => restore.mutate(item.id) : undefined}
                restoring={restore.isPending && restore.variables === item.id}
              />
            ))}
          </ul>
          <Pagination meta={news.data.meta} onPageChange={(next) => updateParams({ page: String(next) })} />
        </>
      )}
    </div>
  );
}
