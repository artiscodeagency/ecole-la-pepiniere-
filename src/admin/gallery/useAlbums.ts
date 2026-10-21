import { useQuery } from "@tanstack/react-query";

import { type AdminGalleryAlbum, ALBUMS_QUERY_KEY } from "@/admin/gallery/types";
import { api } from "@/lib/api/client";

/** Every album, in display order, with its photo counts. */
export function useAlbums() {
  return useQuery({
    queryKey: ALBUMS_QUERY_KEY,
    queryFn: async () => (await api<{ data: AdminGalleryAlbum[] }>("/admin/gallery/categories")).data,
  });
}
