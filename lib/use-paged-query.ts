"use client";

import { useQuery } from "@tanstack/react-query";
import type { PagedResponse } from "@/lib/pagination";
import type { QueryKeys } from "@/lib/query-keys";

/**
 * Generic hook for a server-paginated list. Modules pass their key factory and
 * service call; page/size/filters flow into both the cache key and the request,
 * so a filter change is a cache entry of its own (no stale mixing).
 */
export function usePagedQuery<TItem, TFilters = undefined>(options: {
  keys: QueryKeys<TFilters>;
  page: number;
  size: number;
  filters?: TFilters;
  fetch: (page: number, size: number, filters: TFilters) => Promise<PagedResponse<TItem>>;
}) {
  const { keys, page, size, filters, fetch } = options;
  return useQuery({
    queryKey: keys.list(page, size, filters),
    queryFn: () => fetch(page, size, filters as TFilters),
  });
}
