/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
    // Bundle the SQL files that live outside the frontend/ root so they are
    // available on Vercel's read-only filesystem at runtime.
    outputFileTracingIncludes: {
      "/**": ["../database/*.sql"]
    }
  }
};

export default nextConfig;
