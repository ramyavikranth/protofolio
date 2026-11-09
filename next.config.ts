import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Auth + Supabase cookie reads are request-time; keep classic dynamic rendering.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
