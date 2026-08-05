import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  allowedDevOrigins: ["127.0.0.1"],
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
