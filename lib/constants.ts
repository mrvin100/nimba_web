/** All application routes — never hardcode route strings inline. */
export const ROUTES = {
  LOGIN: "/login",
  BOOTSTRAP: "/bootstrap",
  SET_PASSWORD: "/set-password",
  PROFILE: "/profile",
  DRI: "/dri",
  DCM: "/dcm",
  DRC: "/drc",
  ADMIN: "/admin",
  ADMIN_ORGANIZATION: "/admin/organization",
} as const;

/** The DRI dossier list lives at the DRI workspace root. */
export const DOSSIERS = ROUTES.DRI;

/** Builds the path to a credit-case detail page (DRI workspace). */
export function caseDetailPath(id: string): string {
  return `${ROUTES.DRI}/dossiers/${id}`;
}

/** Backend session cookie names (see backend application.yaml). */
export const AUTH_COOKIES = {
  SESSION: "NIMBASESSION",
} as const;
