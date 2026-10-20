import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import type { ApiText, PublicCategory, PublicImage } from "@/lib/api/publicNews";

export interface GalleryCategory {
  id: number;
  slug: string;
  name: ApiText;
  photos_count: number;
  cover: PublicImage | null;
}

export interface GalleryPhoto {
  id: number;
  caption: ApiText;
  alt: ApiText;
  category: PublicCategory | null;
  media: PublicImage;
}

interface PhotosPage {
  data: GalleryPhoto[];
  meta: { current_page: number; last_page: number; total: number };
}

/**
 * Visible categories holding at least one visible photo. An empty list means
 * the school has not put photos in the admin yet: the site keeps its
 * built-in photos until then.
 */
export function useGalleryCategories() {
  return useQuery({
    queryKey: ["public", "gallery", "categories"],
    queryFn: async () => (await api<{ data: GalleryCategory[] }>("/public/gallery/categories")).data,
  });
}

/** Visible photos in the order set in the admin, 24 per page. */
export function useGalleryPhotos(category: string | null, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["public", "gallery", "photos", category],
    queryFn: ({ pageParam }) => {
      const query = new URLSearchParams({ page: String(pageParam) });
      if (category) query.set("category", category);
      return api<PhotosPage>(`/public/gallery/photos?${query}`);
    },
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
    enabled,
  });
}
