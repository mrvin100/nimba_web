import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES, SESSION_COOKIE } from "@/lib/constants";

/**
 * Guards the DRI workspace: a visitor without a session cookie is sent to the
 * login page. This is the cheap first gate — the backend remains the source of
 * truth and rejects any request with an invalid/expired session regardless.
 */
export function proxy(request: NextRequest): NextResponse {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (!hasSession) {
    return NextResponse.redirect(new URL(ROUTES.login, request.url));
  }
  return NextResponse.next();
}

// Guard the dashboard and (future) dossier pages. The login page and /api proxy
// are intentionally excluded so they remain reachable without a session.
export const config = {
  matcher: ["/", "/dossiers/:path*"],
};
