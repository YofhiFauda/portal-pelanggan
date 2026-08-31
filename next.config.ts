import type { NextConfig } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const allowedDevOrigins: string[] = [];

if (appUrl) {
  try {
    const hostname = new URL(appUrl).hostname;
    allowedDevOrigins.push(hostname);
  } catch (error) {
    console.error("Invalid NEXT_PUBLIC_APP_URL in next.config.ts:", error);
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

