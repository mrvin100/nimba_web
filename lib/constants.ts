/** All application routes — never hardcode route strings inline. */
export const ROUTES = {
  LOGIN: "/login",
  BOOTSTRAP: "/bootstrap",
  SET_PASSWORD: "/set-password",
  PROFILE: "/profile",
  DRI: "/dri",
  DCM: "/dcm",
  DRC: "/drc",
  COMITE: "/comite",
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_ORGANIZATION: "/admin/organization",
  ADMIN_AUDIT: "/admin/audit",
} as const;

/** The DRI dossier list lives at the DRI workspace root. */
export const DOSSIERS = ROUTES.DRI;

/** Builds the path to a credit-case detail page; every review workspace mounts one. */
export function caseDetailPath(id: string, workspaceBase: string = ROUTES.DRI): string {
  return `${workspaceBase}/dossiers/${id}`;
}

/** Backend session cookie names (see backend application.yaml). */
export const AUTH_COOKIES = {
  SESSION: "NIMBASESSION",
} as const;
