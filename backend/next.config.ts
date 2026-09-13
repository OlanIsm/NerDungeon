import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The repository already owns its milestone-specific AGENTS.md instructions.
  agentRules: false,
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
};

export default nextConfig;
