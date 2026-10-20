import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, FileText, Plus, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/admin/auth/useAuth";
import { Button, ButtonLink } from "@/admin/components/Button";
import { EmptyState } from "@/admin/components/EmptyState";
import { FormAlert } from "@/admin/components/FormAlert";
import { FilterPills } from "@/admin/components/ListFilters";
import { PageHeader } from "@/admin/components/PageHeader";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { type AdminDocument, DOCUMENT_TYPES, DOCUMENTS_QUERY_KEY, formatFileSize } from "@/admin/documents/types";
import { formatDate } from "@/admin/lib/dates";
import { useListParams } from "@/admin/lib/useListParams";
import { documentEditPath, PATHS } from "@/admin/paths";
import { api } from "@/lib/api/client";
import { usePageMeta } from "@/lib/usePageMeta";

function DocumentRow({ document, onRestore, restoring }: { document: AdminDocument; onRestore?: () => void; restoring?: boolean }) {
  const content = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-alt text-primary-dark">
        <FileText size={22} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="neutral">{DOCUMENT_TYPES[document.type].fr}</StatusBadge>
          {!document.deleted_at &&
            (document.is_public ? (
              <StatusBadge tone="success">Visible sur le site</StatusBadge>
            ) : (
              <StatusBadge tone="muted">Masqué</StatusBadge>
            ))}
          {!document.title.en && <span className="text-xs text-ink-soft">Français seulement</span>}
        </div>
        <p className="mt-1.5 truncate font-semibold text-ink">{document.title.fr}</p>
        <p className="mt-0.5 truncate text-sm text-ink-soft">
          PDF · {formatFileSize(document.file.size_bytes)} · modifié le {formatDate(document.updated_at)}
        </p>
      </div>
    </>
  );

  if (document.deleted_at) {
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
    <li className="flex items-center gap-2 rounded-card border border-border-soft bg-white shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft-lg">
      <Link to={documentEditPath(document.id)} className="flex min-w-0 flex-1 items-center gap-4 p-3">
        {content}
      </Link>
      <a
        href={document.file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mr-3 inline-flex shrink-0 items-center gap-1.5 rounded-btn px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-alt hover:text-ink"
      >
        <ExternalLink size={15} aria-hidden="true" />
        <span className="hidden sm:inline">Ouvrir le PDF</span>
        <span className="sr-only sm:hidden">Ouvrir le PDF de « {document.title.fr} »</span>
      </a>
    </li>
  );
}

export function DocumentListPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const params = useListParams();
  const trashed = params.get("statut") === "corbeille";

  usePageMeta("Documents | Administration La Pépinière", "Documents PDF proposés aux familles.");

  const documents = useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, "list", trashed],
    queryFn: () => api<{ data: AdminDocument[] }>(`/admin/documents${trashed ? "?trashed=1" : ""}`),
  });

  const restore = useMutation({
    mutationFn: (id: number) => api(`/admin/documents/${id}/restore`, { method: "POST" }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY }),
  });

  const filters = [
    { value: "", label: "Documents" },
    ...(user?.role === "director" ? [{ value: "corbeille", label: "Corbeille" }] : []),
  ];

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Les documents PDF proposés aux familles : règlement intérieur, calendrier scolaire…"
        actions={
          <ButtonLink to={PATHS.documentsNew} variant="primary">
            <Plus size={17} aria-hidden="true" />
            Nouveau document
          </ButtonLink>
        }
      />

      {filters.length > 1 && (
        <FilterPills label="Afficher" options={filters} value={trashed ? "corbeille" : ""} onChange={(value) => params.update({ statut: value })} />
      )}

      {restore.isError && (
        <div className="mb-4">
          <FormAlert tone="error">{restore.error.message}</FormAlert>
        </div>
      )}

      {documents.isError ? (
        <div className="space-y-4">
          <FormAlert tone="error">{documents.error.message}</FormAlert>
          <Button onClick={() => void documents.refetch()}>Réessayer</Button>
        </div>
      ) : documents.isPending ? (
        <ul className="space-y-3" aria-hidden="true">
          {[0, 1].map((index) => (
            <li key={index} className="h-18 animate-pulse rounded-card border border-border-soft bg-white" />
          ))}
        </ul>
      ) : documents.data.data.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={trashed ? "La corbeille est vide." : "Aucun document pour le moment."}
          description={trashed ? undefined : "Ajoutez le règlement intérieur et le calendrier scolaire : les parents pourront les ouvrir depuis la page Vie scolaire."}
          action={
            !trashed && (
              <ButtonLink to={PATHS.documentsNew} variant="primary">
                <Plus size={17} aria-hidden="true" />
                Ajouter un document
              </ButtonLink>
            )
          }
        />
      ) : (
        <ul className="space-y-3">
          {documents.data.data.map((item) => (
            <DocumentRow
              key={item.id}
              document={item}
              onRestore={item.can.restore ? () => restore.mutate(item.id) : undefined}
              restoring={restore.isPending && restore.variables === item.id}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
