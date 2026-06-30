/** All application routes — never hardcode route strings inline. */
export const ROUTES = {
  DASHBOARD: "/",
  LOGIN: "/login",
} as const;

/** Backend session cookie names (see backend application.yaml). */
export const AUTH_COOKIES = {
  SESSION: "NIMBASESSION",
} as const;
