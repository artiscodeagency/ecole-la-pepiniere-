import { useEffect, useRef, useState } from "react";

import { ImagePreparationError, prepareImage } from "@/admin/lib/prepareImage";
import { api, ApiError } from "@/lib/api/client";

export interface UploadItem {
  id: number;
  name: string;
  status: "waiting" | "uploading" | "done" | "error";
  error?: string;
}

interface QueuedFile {
  id: number;
  file: File;
  albumId: number;
}

/**
 * Sends the chosen photos one at a time: a phone connection is often slow,
 * and the server processes each photo before taking the next.
 */
export function usePhotoUploads(onUploaded: () => void) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const queue = useRef<QueuedFile[]>([]);
  const running = useRef(false);
  const nextId = useRef(1);
  const onUploadedRef = useRef(onUploaded);

  useEffect(() => {
    onUploadedRef.current = onUploaded;
  }, [onUploaded]);

  const update = (id: number, patch: Partial<UploadItem>) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const run = async () => {
    if (running.current) return;
    running.current = true;
    while (queue.current.length > 0) {
      const { id, file, albumId } = queue.current.shift()!;
      update(id, { status: "uploading" });
      try {
        const form = new FormData();
        form.append("file", await prepareImage(file));
        form.append("category_id", String(albumId));
        await api("/admin/gallery/photos", { method: "POST", body: form });
        update(id, { status: "done" });
        onUploadedRef.current();
      } catch (caught) {
        const message =
          caught instanceof ImagePreparationError
            ? caught.message
            : caught instanceof ApiError
              ? (caught.field("file") ?? caught.message)
              : "L'envoi a échoué.";
        update(id, { status: "error", error: message });
      }
    }
    running.current = false;
  };

  const add = (files: FileList | File[], albumId: number) => {
    const queued = Array.from(files).map((file) => ({ id: nextId.current++, file, albumId }));
    queue.current.push(...queued);
    setItems((current) => [...current, ...queued.map(({ id, file }) => ({ id, name: file.name, status: "waiting" as const }))]);
    void run();
  };

  const clearFinished = () => setItems((current) => current.filter((item) => item.status === "waiting" || item.status === "uploading"));

  return {
    items,
    add,
    clearFinished,
    busy: items.some((item) => item.status === "waiting" || item.status === "uploading"),
  };
}
