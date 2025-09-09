// File: frontend/next.config.ts (Final Fix)

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // THIS IS THE CRITICAL FIX:
  // This tells Next.js to create a small, self-contained build
  // that is optimized for deployment on platforms like Azure.
  output: 'standalone',
};

export default nextConfig;
