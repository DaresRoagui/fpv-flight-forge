import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.STATIC_EXPORT === "1"
    ? { output: "export", distDir: "dist" }
    : {}),
};

export default nextConfig;
