import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { api, ApiError } from "@/lib/api/client";

/** A bilingual text from the API; a missing English text is null. */
export interface ApiText {
  fr: string | null;
  en: string | null;
}

export interface PublicImage {
  urls: { original: string; thumb?: string; medium?: string; large?: string; og?: string };
  width: number | null;
  height: number | null;
  alt: ApiText;
}

export interface PublicCategory {
  id: number;
  slug: string;
  name: ApiText;
}

export interface NewsSummary {
  id: number;
  slug: string;
  title: ApiText;
  excerpt: ApiText;
  category: PublicCategory | null;
  cover: PublicImage | null;
  published_at: string;
  is_featured: boolean;
}

export interface NewsArticle extends NewsSummary {
  body: ApiText;
  seo: { title: ApiText; description: ApiText; image: string | null };
}

interface NewsPage {
  data: NewsSummary[];
  meta: { current_page: number; last_page: number; total: number };
}

const PER_PAGE = 9;

/** Published news, newest first, page by page ("see more"). */
export function useNewsList(category: string | null) {
  return useInfiniteQuery({
    queryKey: ["public", "news", "list", category],
    queryFn: ({ pageParam }) => {
      const query = new URLSearchParams({ page: String(pageParam), per_page: String(PER_PAGE) });
      if (category) query.set("category", category);
      return api<NewsPage>(`/public/news?${query}`);
    },
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
  });
}

/** For the home page: the featured news, or the latest ones when none is featured. */
export function useHomeNews(count: number) {
  return useQuery({
    queryKey: ["public", "news", "home", count],
    queryFn: async () => {
      const featured = await api<NewsPage>(`/public/news?featured=1&per_page=${count}`);
      if (featured.data.length > 0) return featured.data;
      return (await api<NewsPage>(`/public/news?per_page=${count}`)).data;
    },
  });
}

export function useNewsCategories() {
  return useQuery({
    queryKey: ["public", "news", "categories"],
    queryFn: async () => (await api<{ data: PublicCategory[] }>("/public/news-categories")).data,
    staleTime: Infinity,
  });
}

/** One article; null when it does not exist or is not published. */
export function useNewsArticle(slug: string) {
  return useQuery({
    queryKey: ["public", "news", "article", slug],
    queryFn: async () => {
      try {
        return (await api<{ data: NewsArticle }>(`/public/news/${encodeURIComponent(slug)}`)).data;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });
}
