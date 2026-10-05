import { useQuery } from "@tanstack/react-query";

import { NEWS_CATEGORIES_QUERY_KEY } from "@/admin/news/types";
import type { Category } from "@/admin/types";
import { api } from "@/lib/api/client";

/** The official news categories (seeded from the public site). */
export function useNewsCategories() {
  return useQuery({
    queryKey: NEWS_CATEGORIES_QUERY_KEY,
    queryFn: async () => (await api<{ data: Category[] }>("/public/news-categories")).data,
    staleTime: Infinity,
  });
}
