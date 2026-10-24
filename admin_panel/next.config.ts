import type { NextConfig } from 'next';

// Static export served from futureinnvo.com/admin (public_html/admin on cPanel).
// Pages use query strings (?model=…&id=…) instead of dynamic routes so every
// screen is a plain HTML file that needs no Node server.
const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/admin',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
