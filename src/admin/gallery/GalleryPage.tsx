import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FolderCog,
  ImagePlus,
  Images,
  Loader2,
  type LucideIcon,
  Pencil,
  RotateCcw,
  Star,
  Trash2,
} from "lucide-react";
import { type ChangeEvent, useCallback, useRef, useState } from "react";

import { useAuth } from "@/admin/auth/useAuth";
import { Button, ButtonLink } from "@/admin/components/Button";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { EmptyState } from "@/admin/components/EmptyState";
import { FormAlert } from "@/admin/components/FormAlert";
import { FilterPills } from "@/admin/components/ListFilters";
import { PageHeader } from "@/admin/components/PageHeader";
import { Pagination } from "@/admin/components/Pagination";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { PhotoEditDialog } from "@/admin/gallery/PhotoEditDialog";
import { type AdminGalleryPhoto, GALLERY_QUERY_KEY } from "@/admin/gallery/types";
import { useAlbums } from "@/admin/gallery/useAlbums";
import { usePhotoUploads } from "@/admin/gallery/usePhotoUploads";
import { useListParams } from "@/admin/lib/useListParams";
import { PATHS } from "@/admin/paths";
import type { Paginated } from "@/admin/types";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/lib/usePageMeta";

const TRASH = "corbeille";

function IconButton({ icon: Icon, label, onClick, disabled }: { icon: LucideIcon; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-btn text-ink-soft transition-colors hover:bg-surface-alt hover:text-ink disabled:opacity-30"
    >
      <Icon size={17} aria-hidden="true" />
    </button>
  );
}

export function GalleryPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const params = useListParams();
  const albums = useAlbums();
  const fileInput = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<AdminGalleryPhoto | null>(null);
  const [deleting, setDeleting] = useState<AdminGalleryPhoto | null>(null);
  const isDirector = user?.role === "director";

  usePageMeta("Galerie | Administration La Pépinière", "Gestion de la galerie photo.");

  const selected = params.get("album");
  const inTrash = selected === TRASH;
  const albumId = inTrash ? null : Number(selected) || albums.data?.[0]?.id || null;
  const album = albums.data?.find((item) => item.id === albumId);

  const query = new URLSearchParams(inTrash ? { trashed: "1" } : { category: String(albumId ?? "") });
  if (params.page > 1) query.set("page", String(params.page));
  const photos = useQuery({
    queryKey: [...GALLERY_QUERY_KEY, "photos", query.toString()],
    queryFn: () => api<Paginated<AdminGalleryPhoto>>(`/admin/gallery/photos?${query}`),
    enabled: inTrash || albumId !== null,
    placeholderData: keepPreviousData,
  });

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  }, [queryClient]);
  const uploads = usePhotoUploads(refresh);

  const action = useMutation({
    mutationFn: ({ path, method, body }: { path: string; method: "POST" | "PATCH" | "PUT" | "DELETE"; body?: unknown }) =>
      api(path, { method, body }),
    onSuccess: refresh,
  });

  const run = (path: string, method: "POST" | "PATCH" | "PUT" | "DELETE", body?: unknown) => action.mutate({ path, method, body });

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length && albumId !== null) uploads.add(event.target.files, albumId);
    event.target.value = "";
  };

  const options = [
    ...(albums.data ?? []).map((item) => ({ value: String(item.id), label: `${item.name.fr} (${item.photos_count})` })),
    ...(isDirector ? [{ value: TRASH, label: "Corbeille" }] : []),
  ];
  const list = photos.data?.data ?? [];
  const isFirst = (index: number) => params.page === 1 && index === 0;
  const isLast = (index: number) =>
    photos.data !== undefined && params.page === photos.data.meta.last_page && index === list.length - 1;

  return (
    <div>
      <PageHeader
        title="Galerie"
        description="Les photos de l'école, classées par album. Les photos de téléphone sont réduites automatiquement."
        actions={
          <>
            <ButtonLink to={`${PATHS.gallery}/albums`}>
              <FolderCog size={17} aria-hidden="true" />
              Gérer les albums
            </ButtonLink>
            {!inTrash && (
              <Button variant="primary" onClick={() => fileInput.current?.click()} disabled={albumId === null}>
                <ImagePlus size={17} aria-hidden="true" />
                Ajouter des photos
              </Button>
            )}
          </>
        }
      />
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={handleFiles}
        aria-label="Choisir des photos"
      />

      {albums.isError && <FormAlert tone="error">{albums.error.message}</FormAlert>}
      {albums.data && (
        <FilterPills
          label="Album"
          options={options}
          value={inTrash ? TRASH : String(albumId)}
          onChange={(value) => params.update({ album: value })}
        />
      )}

      {uploads.items.length > 0 && (
        <section aria-label="Envoi des photos" className="mb-6 rounded-card border border-border-soft bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">
              {uploads.busy
                ? `Envoi en cours : ${uploads.items.filter((item) => item.status === "done").length}/${uploads.items.length}`
                : "Envoi terminé"}
            </p>
            {!uploads.busy && (
              <Button variant="ghost" onClick={uploads.clearFinished}>
                Masquer
              </Button>
            )}
          </div>
          <ul className="max-h-48 space-y-1.5 overflow-y-auto text-sm" aria-live="polite">
            {uploads.items.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                {item.status === "done" && <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary-dark" aria-label="Envoyée" />}
                {item.status === "error" && <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-700" aria-label="Erreur" />}
                {(item.status === "waiting" || item.status === "uploading") && (
                  <Loader2
                    size={16}
                    className={cn("mt-0.5 shrink-0 text-ink-soft", item.status === "uploading" && "animate-spin")}
                    aria-label={item.status === "waiting" ? "En attente" : "Envoi"}
                  />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-ink">{item.name}</span>
                  {item.error && <span className="block text-red-700">{item.error}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {album && !album.is_visible && (
        <div className="mb-5">
          <FormAlert tone="error">Cet album est masqué : ses photos ne sont pas visibles sur le site.</FormAlert>
        </div>
      )}
      {action.isError && (
        <div className="mb-5">
          <FormAlert tone="error">{action.error.message}</FormAlert>
        </div>
      )}

      {photos.isError ? (
        <div className="space-y-4">
          <FormAlert tone="error">{photos.error.message}</FormAlert>
          <Button onClick={() => void photos.refetch()}>Réessayer</Button>
        </div>
      ) : albums.isPending || photos.isPending ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <li key={index} className="aspect-4/3 animate-pulse rounded-card bg-white" />
          ))}
        </ul>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Images}
          title={inTrash ? "La corbeille est vide." : "Aucune photo dans cet album."}
          description={inTrash ? undefined : "Ajoutez des photos : vous pouvez en choisir plusieurs à la fois."}
          action={
            !inTrash && (
              <Button variant="primary" onClick={() => fileInput.current?.click()}>
                <ImagePlus size={17} aria-hidden="true" />
                Ajouter des photos
              </Button>
            )
          }
        />
      ) : (
        <>
          <ul className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4", photos.isPlaceholderData && "opacity-60")}>
            {list.map((photo, index) => {
              const isCover = album?.cover?.id === photo.media.id;
              return (
                <li key={photo.id} className="overflow-hidden rounded-card border border-border-soft bg-white shadow-soft">
                  <div className="relative aspect-4/3 bg-surface-alt">
                    <img
                      src={photo.media.urls.medium ?? photo.media.urls.thumb}
                      alt={photo.alt.fr ?? ""}
                      loading="lazy"
                      className={cn("h-full w-full object-cover", !photo.is_visible && "opacity-50")}
                    />
                    <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
                      {isCover && (
                        <StatusBadge tone="warning">
                          <Star size={12} aria-hidden="true" />
                          Couverture
                        </StatusBadge>
                      )}
                      {!photo.is_visible && <StatusBadge tone="muted">Masquée</StatusBadge>}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className={cn("truncate text-sm", photo.caption.fr ? "text-ink" : "italic text-ink-soft")}>
                      {photo.caption.fr ?? "Sans légende"}
                    </p>
                    {photo.deleted_at ? (
                      photo.can.restore && (
                        <Button
                          className="mt-2 w-full"
                          onClick={() => run(`/admin/gallery/photos/${photo.id}/restore`, "POST")}
                          pending={action.isPending}
                        >
                          <RotateCcw size={16} aria-hidden="true" />
                          Restaurer
                        </Button>
                      )
                    ) : (
                      <div className="mt-2 flex flex-wrap items-center gap-0.5">
                        <IconButton icon={Pencil} label="Modifier" onClick={() => setEditing(photo)} />
                        <IconButton
                          icon={ArrowLeft}
                          label="Déplacer avant"
                          disabled={isFirst(index) || action.isPending}
                          onClick={() => run(`/admin/gallery/photos/${photo.id}/move`, "POST", { direction: "before" })}
                        />
                        <IconButton
                          icon={ArrowRight}
                          label="Déplacer après"
                          disabled={isLast(index) || action.isPending}
                          onClick={() => run(`/admin/gallery/photos/${photo.id}/move`, "POST", { direction: "after" })}
                        />
                        <IconButton
                          icon={photo.is_visible ? EyeOff : Eye}
                          label={photo.is_visible ? "Masquer sur le site" : "Afficher sur le site"}
                          disabled={action.isPending}
                          onClick={() => run(`/admin/gallery/photos/${photo.id}`, "PATCH", { is_visible: !photo.is_visible })}
                        />
                        <IconButton
                          icon={Star}
                          label="Choisir comme couverture de l'album"
                          disabled={isCover || action.isPending}
                          onClick={() => run(`/admin/gallery/categories/${photo.category_id}`, "PUT", { cover_media_id: photo.media.id })}
                        />
                        {photo.can.delete && <IconButton icon={Trash2} label="Supprimer" onClick={() => setDeleting(photo)} />}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {photos.data && <Pagination meta={photos.data.meta} onPageChange={(next) => params.update({ page: String(next) })} />}
        </>
      )}

      {editing && albums.data && (
        <PhotoEditDialog photo={editing} albums={albums.data} onClose={() => setEditing(null)} onSaved={refresh} />
      )}
      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer cette photo ?"
        message={
          isDirector
            ? "Elle sera retirée du site et placée dans la corbeille, d'où vous pourrez la restaurer."
            : "Elle sera retirée du site. Le Directeur peut la restaurer depuis la corbeille."
        }
        confirmLabel="Supprimer"
        pending={action.isPending}
        onConfirm={() => {
          if (deleting) run(`/admin/gallery/photos/${deleting.id}`, "DELETE");
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
