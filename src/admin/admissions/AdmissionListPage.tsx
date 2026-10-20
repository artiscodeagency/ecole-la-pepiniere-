import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { type AdmissionPage, ADMISSION_STATUS, ADMISSIONS_QUERY_KEY } from "@/admin/admissions/types";
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
import { admissionPath } from "@/admin/paths";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/lib/usePageMeta";

export function AdmissionListPage() {
  const params = useListParams();
  const status = params.get("statut");
  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim());

  usePageMeta("Demandes d'inscription | Administration La Pépinière", "Demandes envoyées par le formulaire d'inscription.");

  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (searchTerm) query.set("q", searchTerm);
  if (params.page > 1) query.set("page", String(params.page));

  const admissions = useQuery({
    queryKey: [...ADMISSIONS_QUERY_KEY, "list", query.toString()],
    queryFn: () => api<AdmissionPage>(`/admin/admission-requests?${query}`),
    placeholderData: keepPreviousData,
  });

  const counts = admissions.data?.counts;
  const filters = [
    { value: "", label: "Toutes" },
    { value: "new", label: `Nouvelles${counts ? ` (${counts.new})` : ""}` },
    { value: "in_progress", label: `En cours${counts ? ` (${counts.in_progress})` : ""}` },
    { value: "handled", label: "Traitées" },
  ];
  const filtered = Boolean(status || searchTerm);

  return (
    <div>
      <PageHeader
        title="Demandes d'inscription"
        description="Les demandes envoyées par les familles depuis la page Admissions du site."
      />

      <FilterPills label="Filtrer par statut" options={filters} value={status} onChange={(value) => params.update({ statut: value })} />
      <SearchBar
        label="Rechercher une demande"
        value={search}
        onChange={(value) => {
          setSearch(value);
          if (params.page > 1) params.update({});
        }}
        placeholder="Parent, enfant, niveau, téléphone…"
      />

      {admissions.isError ? (
        <div className="space-y-4">
          <FormAlert tone="error">{admissions.error.message}</FormAlert>
          <Button onClick={() => void admissions.refetch()}>Réessayer</Button>
        </div>
      ) : admissions.isPending ? (
        <ul className="space-y-3" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <li key={index} className="h-22 animate-pulse rounded-card border border-border-soft bg-white" />
          ))}
        </ul>
      ) : admissions.data.data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={filtered ? "Aucune demande ne correspond à ces filtres." : "Aucune demande pour le moment."}
          description={filtered ? undefined : "Les demandes du formulaire d'inscription du site arriveront ici."}
        />
      ) : (
        <>
          <ul className={cn("space-y-3", admissions.isPlaceholderData && "opacity-60")}>
            {admissions.data.data.map((admission) => {
              const isNew = admission.status === "new";
              return (
                <li key={admission.id}>
                  <Link
                    to={admissionPath(admission.id)}
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
                        <p className={cn("truncate text-ink", isNew ? "font-bold" : "font-semibold")}>
                          {admission.child_name}
                          <span className="font-normal text-ink-soft"> · {admission.child_age} an{admission.child_age > 1 ? "s" : ""}</span>
                        </p>
                        <p className="shrink-0 text-xs text-ink-soft">{formatDateTime(admission.created_at)}</p>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <StatusBadge tone={ADMISSION_STATUS[admission.status].tone}>{ADMISSION_STATUS[admission.status].label}</StatusBadge>
                        {admission.level && <p className={cn("truncate text-sm text-ink", isNew && "font-semibold")}>{admission.level}</p>}
                      </div>
                      <p className="mt-1 truncate text-sm text-ink-soft">
                        Parent : {admission.parent_name} · {admission.phone}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Pagination meta={admissions.data.meta} onPageChange={(next) => params.update({ page: String(next) })} />
        </>
      )}
    </div>
  );
}
