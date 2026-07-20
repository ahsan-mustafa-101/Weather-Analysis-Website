import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Lets the dev server accept requests from these origins in
   * addition to the default (localhost). Relevant if you ever test
   * on a phone/tablet over your LAN (e.g. http://192.168.x.x:3000)
   * or via 127.0.0.1 instead of localhost — without this, Next's
   * dev-mode origin check silently blocks the hot-reload/asset
   * connection from those origins.
   */
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;