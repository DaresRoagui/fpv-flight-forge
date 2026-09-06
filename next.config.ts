import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.cdn.shopify.com" },
      { protocol: "https", hostname: "betafpv.com" },
      { protocol: "https", hostname: "www.skyzonefpv.com" },
      { protocol: "https", hostname: "se-cdn.djiits.com" },
      { protocol: "https", hostname: "geprc.com" },
      { protocol: "https", hostname: "**.oss-cn-hongkong.aliyuncs.com" },
      { protocol: "https", hostname: "www.stonehobby.com" },
      { protocol: "https", hostname: "radiomasterrc.com" },
      { protocol: "https", hostname: "viflydrone.com" },
      { protocol: "https", hostname: "newbeedrone.com" },
      { protocol: "https", hostname: "www.toolkitrc.com" },
      { protocol: "https", hostname: "**.ovonicshop.com" },
      { protocol: "https", hostname: "www.unmannedtechshop.co.uk" },
      { protocol: "https", hostname: "us.ovonicshop.com" },
      { protocol: "https", hostname: "iflight-rc.eu" },
      { protocol: "https", hostname: "www.droneauthority.co.uk" },
    ],
  },
  ...(process.env.STATIC_EXPORT === "1"
    ? { output: "export", distDir: "dist" }
    : {}),
};

export default nextConfig;
