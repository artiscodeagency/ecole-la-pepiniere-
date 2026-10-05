import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/admin/components/Button";
import { Dialog } from "@/admin/components/Dialog";
import { FormAlert } from "@/admin/components/FormAlert";
import { SelectField, TextField } from "@/admin/components/FormField";
import type { AdminGalleryAlbum, AdminGalleryPhoto } from "@/admin/gallery/types";
import { api, ApiError } from "@/lib/api/client";

interface PhotoEditDialogProps {
  photo: AdminGalleryPhoto;
  albums: AdminGalleryAlbum[];
  onClose: () => void;
  onSaved: () => void;
}

/** Caption, description for screen readers and album of one photo. */
export function PhotoEditDialog({ photo, albums, onClose, onSaved }: PhotoEditDialogProps) {
  const [values, setValues] = useState({
    caption_fr: photo.caption.fr ?? "",
    caption_en: photo.caption.en ?? "",
    alt_fr: photo.alt.fr ?? "",
    alt_en: photo.alt.en ?? "",
    category_id: String(photo.category_id),
  });
  const set = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }));

  const save = useMutation({
    mutationFn: () =>
      api(`/admin/gallery/photos/${photo.id}`, {
        method: "PATCH",
        body: {
          caption_fr: values.caption_fr || null,
          caption_en: values.caption_en || null,
          alt_fr: values.alt_fr,
          alt_en: values.alt_en || null,
          category_id: Number(values.category_id),
        },
      }),
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
      title="Modifier la photo"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" form="photo-edit-form" variant="primary" pending={save.isPending}>
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="photo-edit-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        <img src={photo.media.urls.medium ?? photo.media.urls.original} alt="" className="aspect-video w-full rounded-btn object-cover" />
        {error && !Object.keys(error.errors).length && <FormAlert tone="error">{error.message}</FormAlert>}
        <TextField
          label="Légende (français)"
          value={values.caption_fr}
          onChange={(event) => set("caption_fr", event.target.value)}
          error={error?.field("caption_fr")}
          hint="Facultative, affichée sous la photo."
          maxLength={255}
          autoFocus
        />
        <TextField
          label="Légende (anglais)"
          value={values.caption_en}
          onChange={(event) => set("caption_en", event.target.value)}
          error={error?.field("caption_en")}
          maxLength={255}
        />
        <TextField
          label="Description (français)"
          value={values.alt_fr}
          onChange={(event) => set("alt_fr", event.target.value)}
          error={error?.field("alt_fr")}
          hint="Lue aux personnes malvoyantes : ce que montre la photo."
          required
          maxLength={255}
        />
        <TextField
          label="Description (anglais)"
          value={values.alt_en}
          onChange={(event) => set("alt_en", event.target.value)}
          error={error?.field("alt_en")}
          maxLength={255}
        />
        <SelectField
          label="Album"
          value={values.category_id}
          onChange={(event) => set("category_id", event.target.value)}
          error={error?.field("category_id")}
          hint="Changer d'album place la photo à la fin du nouvel album."
        >
          {albums.map((album) => (
            <option key={album.id} value={album.id}>
              {album.name.fr}
            </option>
          ))}
        </SelectField>
      </form>
    </Dialog>
  );
}
