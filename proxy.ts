import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIES, ROUTES } from "@/lib/constants";

/**
 * Guards the DRI workspace: a visitor without a session cookie is sent to the
 * login page. This is the cheap first gate — the backend remains the source of
 * truth and rejects any request with an invalid/expired session regardless.
 *
 * `proxy` is the Next.js 16 replacement for the deprecated `middleware` export.
 */
export function proxy(request: NextRequest): NextResponse {
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIES.SESSION)?.value);
  if (!hasSession) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }
  return NextResponse.next();
}

// Guard the dashboard and (future) dossier pages. The login page and /api proxy
// are intentionally excluded so they remain reachable without a session.
export const config = {
  matcher: ["/", "/dossiers/:path*"],
};
