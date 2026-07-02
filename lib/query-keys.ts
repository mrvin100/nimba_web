/**
 * Query-key factory shared by every module's hook file. One shape for the whole
 * app so cache invalidation is uniform: `keys.all` invalidates everything in the
 * domain, `keys.lists()` every list page, `keys.detail(id)` one entity.
 */
export function queryKeys<TFilters = unknown>(domain: string) {
  return {
    all: [domain] as const,
    lists: () => [domain, "list"] as const,
    list: (page: number, size: number, filters?: TFilters) =>
      filters === undefined
        ? ([domain, "list", page, size] as const)
        : ([domain, "list", page, size, filters] as const),
    detail: (id: string) => [domain, "detail", id] as const,
  };
}

export type QueryKeys<TFilters = unknown> = ReturnType<typeof queryKeys<TFilters>>;
