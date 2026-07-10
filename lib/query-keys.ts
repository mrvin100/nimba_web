/**
 * The app's cache scopes — THE single registry guaranteeing that two modules can
 * never collide on a key prefix. Every module's key object is built on its scope
 * from here; raw strings never appear at a call site.
 */
export const QUERY_SCOPES = {
  identity: "identity",
  creditCases: "credit-cases",
  amortization: "amortization",
  analysisSheet: "analysis-sheet",
  admin: "admin-users",
  adminOrganization: "admin-organization",
  adminStats: "admin-stats",
  team: "team-members",
  audit: "audit",
  notification: "notification",
} as const;

export type QueryScope = (typeof QUERY_SCOPES)[keyof typeof QUERY_SCOPES];

/**
 * Query-key factory shared by every module's hook file. One shape for the whole
 * app so cache invalidation is uniform: `keys.all` invalidates everything in the
 * domain, `keys.lists()` every list page, `keys.detail(id)` one entity.
 */
export function queryKeys<TFilters = unknown>(domain: QueryScope) {
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
