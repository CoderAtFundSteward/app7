// Origin the FastAPI app is reachable at (used only by Next.js rewrites — not exposed to the
// browser). On Vercel, set this to your Railway URL and leave NEXT_PUBLIC_API_URL unset so
// the browser calls /api/... same-origin and avoids CORS.
const backendOrigin = (
  process.env.BACKEND_ORIGIN ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000"
)
  .replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // FastAPI routes live under /api/... on the backend — keep that prefix.
        destination: `${backendOrigin}/api/:path*`
      }
    ];
  }
};

export default nextConfig;
