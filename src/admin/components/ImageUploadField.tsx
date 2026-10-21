import { ImagePlus, Trash2 } from "lucide-react";
import { type ChangeEvent, useId, useRef, useState } from "react";

import { Button } from "@/admin/components/Button";
import { FormAlert } from "@/admin/components/FormAlert";
import { ImagePreparationError, prepareImage } from "@/admin/lib/prepareImage";
import type { Media } from "@/admin/types";
import { api, ApiError } from "@/lib/api/client";

interface ImageUploadFieldProps {
  label: string;
  value: Media | null;
  onChange: (media: Media | null) => void;
  hint?: string;
  error?: string;
}

/** Picks a photo, prepares it in the browser, uploads it and shows a preview. */
export function ImageUploadField({ label, value, onChange, hint, error }: ImageUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", await prepareImage(file));
      const { data } = await api<{ data: Media }>("/admin/media", { method: "POST", body: form });
      onChange(data);
    } catch (caught) {
      if (caught instanceof ImagePreparationError) setUploadError(caught.message);
      else if (caught instanceof ApiError) setUploadError(caught.field("file") ?? caught.message);
      else setUploadError("L'envoi de la photo a échoué. Réessayez.");
    } finally {
      setUploading(false);
    }
  };

  const preview = value?.urls.medium ?? value?.urls.large ?? value?.urls.original;

  return (
    <div>
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFile}
        disabled={uploading}
      />

      <div className="mt-2 overflow-hidden rounded-btn border border-border-soft bg-surface-alt">
        {preview ? (
          <img src={preview} alt="" className="aspect-video w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-video w-full flex-col items-center justify-center gap-2 text-sm text-ink-soft transition-colors hover:bg-primary-light hover:text-primary-dark"
          >
            <ImagePlus size={28} aria-hidden="true" />
            {uploading ? "Envoi de la photo…" : "Choisir une photo"}
          </button>
        )}
      </div>

      {preview && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button pending={uploading} onClick={() => inputRef.current?.click()}>
            <ImagePlus size={16} aria-hidden="true" />
            {uploading ? "Envoi…" : "Remplacer"}
          </Button>
          <Button variant="ghost" onClick={() => onChange(null)} disabled={uploading}>
            <Trash2 size={16} aria-hidden="true" />
            Retirer
          </Button>
        </div>
      )}

      {hint && <p className="mt-2 text-xs leading-relaxed text-ink-soft">{hint}</p>}
      {(uploadError || error) && (
        <div className="mt-3">
          <FormAlert tone="error">{uploadError ?? error}</FormAlert>
        </div>
      )}
    </div>
  );
}
