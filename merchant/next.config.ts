import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config, { dir }) => {
    // Ensure webpack resolves modules from the current project directory first
    config.resolve.modules = [
      path.resolve(dir, "node_modules"),
      ...(config.resolve.modules || []),
    ];
    return config;
  },
  // Turbopack configuration - empty for now to silence the warning
  // Module resolution should work correctly with Turbopack by default
  turbopack: {},
};

export default nextConfig;
