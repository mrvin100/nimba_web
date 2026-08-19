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
 * Tells the backend which origin the browser actually used. Proxying replaces the
 * public host with the internal one (`app:8080`), so without these headers the
 * backend reconstructs every URL from that internal host: a call the browser made
 * same-origin then looks cross-origin, and its CORS filter rejects every write
 * with 403 "Invalid CORS request" unless `CORS_ALLOWED_ORIGINS` happens to match
 * the address bar exactly. Reads still pass, because browsers only send `Origin`
 * on writes, which is what made this fail so selectively (the bootstrap page could
 * read "no admin yet" but not create one). The backend consumes these via
 * `server.forward-headers-strategy`.
 */
function forwardedHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  // `Host` is the only host this hop can trust: Next.js populates x-forwarded-host
  // from it, discarding whatever a front proxy may have put there. So a TLS
  // terminator in front of this stack must pass the original host through
  // (nginx: `proxy_set_header Host $host`) — see infra/README.md. An upstream
  // x-forwarded-proto, in contrast, does survive, which is how `https` reaches the
  // backend; the fallback below only covers a bare deployment.
  const host = request.headers.get("host");
  if (!host) return headers;

  headers.set("x-forwarded-host", host);
  headers.set("x-forwarded-proto", headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", ""));
  // The port has to be restated from that host rather than left alone: Next.js
  // fills x-forwarded-port with the port this container listens on (3000), which
  // overrides the host above and is not the port the browser dialed — a request
  // for https://nimba.your-bank.tld would reach the backend as ...tld:3000, a
  // different origin than the browser sent, and the write would be rejected as
  // cross-origin. Removing it when the host carries no port lets the scheme's
  // default (443/80) apply, which is exactly what the browser used.
  const explicitPort = /:(\d+)$/.exec(host)?.[1];
  if (explicitPort) headers.set("x-forwarded-port", explicitPort);
  else headers.delete("x-forwarded-port");
  return headers;
}

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
    return NextResponse.rewrite(destination, { request: { headers: forwardedHeaders(request) } });
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
