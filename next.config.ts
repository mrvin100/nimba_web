import type { NextConfig } from "next";

// Baseline security headers applied to every response. A full CSP is tightened
// during the pre-launch security review (NIMBA-30); these are the safe defaults.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

// The /api proxy itself lives in proxy.ts (Next.js 16 middleware), not here:
// rewrites() below is evaluated once at `next build` time and its resolved
// destination gets frozen into `.next/routes-manifest.json`, so a container's
// runtime BACKEND_ORIGIN would have no effect. Middleware runs per-request, so
// it can read the env var fresh every time.

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
