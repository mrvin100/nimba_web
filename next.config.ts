import type { NextConfig } from "next";

// Baseline security headers applied to every response. A full CSP is tightened
// during the pre-launch security review (NIMBA-30); these are the safe defaults.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

// Backend origin the dev proxy forwards to. The browser only ever calls this app
// (same origin), so the SameSite=Strict session cookie flows without CORS.
const backendOrigin = process.env.BACKEND_ORIGIN ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendOrigin}/api/:path*` }];
  },
};

export default nextConfig;
