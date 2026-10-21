import { useSearchParams } from "react-router-dom";

/**
 * Filters of a list kept in the address, so "Back" and a reload keep them.
 * Changing any filter returns to the first page.
 */
export function useListParams() {
  const [params, setParams] = useSearchParams();

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!("page" in changes)) next.delete("page");
    setParams(next, { replace: true });
  };

  return {
    get: (key: string) => params.get(key) ?? "",
    page: Number(params.get("page") ?? "1") || 1,
    update,
  };
}
