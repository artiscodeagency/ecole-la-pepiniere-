import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/admin/components/Button";
import { EmptyState } from "@/admin/components/EmptyState";
import { FormAlert } from "@/admin/components/FormAlert";
import { FilterPills, SearchBar } from "@/admin/components/ListFilters";
import { PageHeader } from "@/admin/components/PageHeader";
import { Pagination } from "@/admin/components/Pagination";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { formatDateTime } from "@/admin/lib/dates";
import { useDebouncedValue } from "@/admin/lib/useDebouncedValue";
import { useListParams } from "@/admin/lib/useListParams";
import { MESSAGE_STATUS, type MessagePage, MESSAGES_QUERY_KEY } from "@/admin/messages/types";
import { messagePath } from "@/admin/paths";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/lib/usePageMeta";

export function MessageListPage() {
  const params = useListParams();
  const status = params.get("statut");
  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim());

  usePageMeta("Messages | Administration La Pépinière", "Messages reçus par le formulaire de contact.");

  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (searchTerm) query.set("q", searchTerm);
  if (params.page > 1) query.set("page", String(params.page));

  const messages = useQuery({
    queryKey: [...MESSAGES_QUERY_KEY, "list", query.toString()],
    queryFn: () => api<MessagePage>(`/admin/contact-messages?${query}`),
    placeholderData: keepPreviousData,
  });

  const counts = messages.data?.counts;
  const filters = [
    { value: "", label: "Tous" },
    { value: "new", label: `Nouveaux${counts ? ` (${counts.new})` : ""}` },
    { value: "read", label: "Lus" },
    { value: "handled", label: "Traités" },
  ];
  const filtered = Boolean(status || searchTerm);

  return (
    <div>
      <PageHeader title="Messages" description="Les messages envoyés par les familles depuis la page Contact du site." />

      <FilterPills label="Filtrer par statut" options={filters} value={status} onChange={(value) => params.update({ statut: value })} />
      <SearchBar
        label="Rechercher un message"
        value={search}
        onChange={(value) => {
          setSearch(value);
          if (params.page > 1) params.update({});
        }}
        placeholder="Nom, email, téléphone, sujet…"
      />

      {messages.isError ? (
        <div className="space-y-4">
          <FormAlert tone="error">{messages.error.message}</FormAlert>
          <Button onClick={() => void messages.refetch()}>Réessayer</Button>
        </div>
      ) : messages.isPending ? (
        <ul className="space-y-3" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <li key={index} className="h-22 animate-pulse rounded-card border border-border-soft bg-white" />
          ))}
        </ul>
      ) : messages.data.data.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={filtered ? "Aucun message ne correspond à ces filtres." : "Aucun message pour le moment."}
          description={filtered ? undefined : "Les messages du formulaire de contact du site arriveront ici."}
        />
      ) : (
        <>
          <ul className={cn("space-y-3", messages.isPlaceholderData && "opacity-60")}>
            {messages.data.data.map((message) => {
              const isNew = message.status === "new";
              return (
                <li key={message.id}>
                  <Link
                    to={messagePath(message.id)}
                    className={cn(
                      "flex gap-4 rounded-card border bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg",
                      isNew ? "border-primary/50" : "border-border-soft",
                    )}
                  >
                    <span
                      className={cn("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", isNew ? "bg-primary-dark" : "bg-transparent")}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <p className={cn("truncate text-ink", isNew ? "font-bold" : "font-semibold")}>{message.name}</p>
                        <p className="shrink-0 text-xs text-ink-soft">{formatDateTime(message.created_at)}</p>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <StatusBadge tone={MESSAGE_STATUS[message.status].tone}>{MESSAGE_STATUS[message.status].label}</StatusBadge>
                        <p className={cn("truncate text-sm text-ink", isNew && "font-semibold")}>{message.subject}</p>
                      </div>
                      <p className="mt-1 truncate text-sm text-ink-soft">{message.excerpt}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Pagination meta={messages.data.meta} onPageChange={(next) => params.update({ page: String(next) })} />
        </>
      )}
    </div>
  );
}
