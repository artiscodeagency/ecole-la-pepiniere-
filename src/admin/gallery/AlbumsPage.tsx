import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Eye, EyeOff, Images, Pencil, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/admin/auth/useAuth";
import { Button } from "@/admin/components/Button";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { Dialog } from "@/admin/components/Dialog";
import { FormAlert } from "@/admin/components/FormAlert";
import { TextField } from "@/admin/components/FormField";
import { PageHeader } from "@/admin/components/PageHeader";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { type AdminGalleryAlbum, GALLERY_QUERY_KEY } from "@/admin/gallery/types";
import { useAlbums } from "@/admin/gallery/useAlbums";
import { PATHS } from "@/admin/paths";
import { api, ApiError } from "@/lib/api/client";
import { usePageMeta } from "@/lib/usePageMeta";

/** Name of a new album, or new names of an existing one. */
function AlbumNameDialog({ album, onClose, onSaved }: { album: AdminGalleryAlbum | null; onClose: () => void; onSaved: () => void }) {
  const [nameFr, setNameFr] = useState(album?.name.fr ?? "");
  const [nameEn, setNameEn] = useState(album?.name.en ?? "");
  const save = useMutation({
    mutationFn: () => {
      const body = { name_fr: nameFr, name_en: nameEn || null };
      return album
        ? api(`/admin/gallery/categories/${album.id}`, { method: "PUT", body })
        : api("/admin/gallery/categories", { method: "POST", body });
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
  });
  const error = save.error instanceof ApiError ? save.error : null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    save.mutate();
  };

  return (
    <Dialog
      open
      title={album ? "Renommer l'album" : "Nouvel album"}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" form="album-form" variant="primary" pending={save.isPending}>
            {album ? "Enregistrer" : "Créer l'album"}
          </Button>
        </>
      }
    >
      <form id="album-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && !Object.keys(error.errors).length && <FormAlert tone="error">{error.message}</FormAlert>}
        <TextField
          label="Nom (français)"
          value={nameFr}
          onChange={(event) => setNameFr(event.target.value)}
          error={error?.field("name_fr")}
          required
          maxLength={255}
          autoFocus
        />
        <TextField
          label="Nom (anglais)"
          value={nameEn}
          onChange={(event) => setNameEn(event.target.value)}
          error={error?.field("name_en")}
          hint="Facultatif : sans traduction, le nom français est affiché."
          maxLength={255}
        />
      </form>
    </Dialog>
  );
}

export function AlbumsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const albums = useAlbums();
  const [renaming, setRenaming] = useState<AdminGalleryAlbum | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminGalleryAlbum | null>(null);

  usePageMeta("Albums | Administration La Pépinière", "Albums de la galerie.");

  const refresh = () => void queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY });
  const action = useMutation({
    mutationFn: ({ path, method, body }: { path: string; method: "PUT" | "DELETE"; body?: unknown }) => api(path, { method, body }),
    onSuccess: refresh,
  });

  const move = (index: number, offset: -1 | 1) => {
    if (!albums.data) return;
    const ids = albums.data.map((album) => album.id);
    [ids[index], ids[index + offset]] = [ids[index + offset], ids[index]];
    action.mutate({ path: "/admin/gallery/categories/order", method: "PUT", body: { ids } });
  };

  return (
    <div>
      <PageHeader
        title="Albums"
        description="L'ordre, les noms et la visibilité des albums de la galerie du site."
        back={{ to: PATHS.gallery, label: "Galerie" }}
        actions={
          user?.role === "director" && (
            <Button variant="primary" onClick={() => setRenaming("new")}>
              <Plus size={17} aria-hidden="true" />
              Nouvel album
            </Button>
          )
        }
      />

      {action.isError && (
        <div className="mb-5">
          <FormAlert tone="error">{action.error instanceof ApiError ? (action.error.field("album") ?? action.error.message) : action.error.message}</FormAlert>
        </div>
      )}

      {albums.isError ? (
        <FormAlert tone="error">{albums.error.message}</FormAlert>
      ) : albums.isPending ? (
        <ul className="space-y-3" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <li key={index} className="h-20 animate-pulse rounded-card border border-border-soft bg-white" />
          ))}
        </ul>
      ) : (
        <ul className="space-y-3">
          {albums.data.map((album, index) => (
            <li key={album.id} className="flex flex-wrap items-center gap-4 rounded-card border border-border-soft bg-white p-3 shadow-soft">
              <Link to={`${PATHS.gallery}?album=${album.id}`} className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-surface-alt">
                {album.cover?.urls.thumb ? (
                  <img src={album.cover.urls.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-ink-soft/50">
                    <Images size={20} aria-hidden="true" />
                  </span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">{album.name.fr}</p>
                  {!album.is_visible && <StatusBadge tone="muted">Masqué</StatusBadge>}
                </div>
                <p className="text-sm text-ink-soft">
                  {album.name.en ?? "Pas de nom anglais"} · {album.photos_count} photo{album.photos_count > 1 ? "s" : ""}
                  {album.photos_count !== album.visible_photos_count && ` (${album.visible_photos_count} visibles)`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" aria-label={`Monter ${album.name.fr}`} title="Monter" disabled={index === 0 || action.isPending} onClick={() => move(index, -1)}>
                  <ArrowUp size={17} aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  aria-label={`Descendre ${album.name.fr}`}
                  title="Descendre"
                  disabled={index === albums.data.length - 1 || action.isPending}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown size={17} aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  aria-label={album.is_visible ? `Masquer ${album.name.fr} sur le site` : `Afficher ${album.name.fr} sur le site`}
                  title={album.is_visible ? "Masquer sur le site" : "Afficher sur le site"}
                  disabled={action.isPending}
                  onClick={() => action.mutate({ path: `/admin/gallery/categories/${album.id}`, method: "PUT", body: { is_visible: !album.is_visible } })}
                >
                  {album.is_visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                </Button>
                <Button variant="ghost" aria-label={`Renommer ${album.name.fr}`} title="Renommer" onClick={() => setRenaming(album)}>
                  <Pencil size={17} aria-hidden="true" />
                </Button>
                {album.can.delete && (
                  <Button variant="ghost" aria-label={`Supprimer ${album.name.fr}`} title="Supprimer" onClick={() => setDeleting(album)}>
                    <Trash2 size={17} aria-hidden="true" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {renaming && (
        <AlbumNameDialog album={renaming === "new" ? null : renaming} onClose={() => setRenaming(null)} onSaved={refresh} />
      )}
      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer cet album ?"
        message="Seul un album sans aucune photo, y compris dans la corbeille, peut être supprimé. Pour le retirer du site sans rien supprimer, masquez-le."
        confirmLabel="Supprimer"
        pending={action.isPending}
        onConfirm={() => {
          if (deleting) action.mutate({ path: `/admin/gallery/categories/${deleting.id}`, method: "DELETE" });
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
