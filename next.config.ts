import type { NextConfig } from "next";

// Baseline security headers applied to every response. A full CSP is tightened
// during the pre-launch security review (NIMBA-30); these are the safe defaults
// that carry no risk of breaking the app.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
