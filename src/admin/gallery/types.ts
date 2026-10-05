import type { Localized, Media } from "@/admin/types";

export interface AdminGalleryAlbum {
  id: number;
  slug: string;
  name: Localized;
  is_visible: boolean;
  sort_order: number;
  /** Photos outside the bin. */
  photos_count: number;
  visible_photos_count: number;
  cover: Media | null;
  can: { delete: boolean };
}

export interface AdminGalleryPhoto {
  id: number;
  caption: Localized;
  alt: Localized;
  category_id: number;
  media: Media;
  sort_order: number;
  is_visible: boolean;
  uploader: string | null;
  created_at: string;
  deleted_at: string | null;
  can: { delete: boolean; restore: boolean };
}

export const GALLERY_QUERY_KEY = ["admin", "gallery"] as const;
export const ALBUMS_QUERY_KEY = [...GALLERY_QUERY_KEY, "albums"] as const;
