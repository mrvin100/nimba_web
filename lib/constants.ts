/** All application routes — never hardcode route strings inline. */
export const ROUTES = {
  DASHBOARD: "/",
  LOGIN: "/login",
  DOSSIERS: "/dossiers",
} as const;

/** Builds the path to a credit-case detail page. */
export function caseDetailPath(id: string): string {
  return `${ROUTES.DOSSIERS}/${id}`;
}

/** Backend session cookie names (see backend application.yaml). */
export const AUTH_COOKIES = {
  SESSION: "NIMBASESSION",
} as const;
