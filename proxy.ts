import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIES, ROUTES } from "@/lib/constants";

// Backend origin the /api proxy forwards to. The browser only ever calls this app
// (same origin), so the SameSite=Strict session cookie flows without CORS. Read
// here (per-request, at runtime) rather than in next.config.ts's `rewrites()`:
// that config is evaluated once during `next build` and its resolved destination
// is frozen into `.next/routes-manifest.json`, so a container's runtime
// BACKEND_ORIGIN would silently have no effect and every request would keep
// hitting whatever host was set (or defaulted) at build time.
const backendOrigin = process.env.BACKEND_ORIGIN ?? "http://localhost:8080";

/**
 * Guards the authenticated workspaces: a visitor without a session cookie is sent
 * to the login page. This is the cheap first gate — the backend remains the source
 * of truth and rejects any request with an invalid/expired session, and the
 * client-side shell enforces per-workspace capability access.
 *
 * Also proxies `/api/*` to the backend (see `backendOrigin` above).
 *
 * `proxy` is the Next.js 16 replacement for the deprecated `middleware` export.
 */
export function proxy(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const destination = new URL(request.nextUrl.pathname + request.nextUrl.search, backendOrigin);
    return NextResponse.rewrite(destination);
  }

  const hasSession = Boolean(request.cookies.get(AUTH_COOKIES.SESSION)?.value);
  if (!hasSession) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }
  return NextResponse.next();
}

// Guard the entry point and every workspace path, and proxy every /api call.
// The login page is intentionally excluded so it remains reachable without a
// session.
export const config = {
  matcher: [
    "/",
    "/profile",
    "/dri/:path*",
    "/dcm/:path*",
    "/drc/:path*",
    "/comite/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};
