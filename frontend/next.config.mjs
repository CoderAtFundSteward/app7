// Origin the FastAPI app is reachable at (used only by Next.js rewrites — not exposed to the
// browser). On Vercel, set BACKEND_ORIGIN to your Railway URL and leave NEXT_PUBLIC_API_URL unset
// so the browser calls /api/... same-origin and avoids CORS.
const rawBackend =
  (process.env.BACKEND_ORIGIN || "").trim() ||
  (process.env.NEXT_PUBLIC_API_URL || "").trim() ||
  "";

if (process.env.VERCEL && !rawBackend) {
  throw new Error(
    "[next.config] On Vercel, set BACKEND_ORIGIN to your FastAPI base URL (e.g. https://…up.railway.app). " +
      "That powers /api/* rewrites. Alternatively set NEXT_PUBLIC_API_URL to call Railway from the browser (requires CORS)."
  );
}

const backendOrigin = (rawBackend || "http://localhost:8000").replace(/\/$/, "");

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
