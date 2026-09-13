import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.cdn.shopify.com" },
      { protocol: "https", hostname: "betafpv.com" },
      { protocol: "https", hostname: "www.skyzonefpv.com" },
      { protocol: "https", hostname: "se-cdn.djiits.com" },
      { protocol: "https", hostname: "www-cdn.djiits.com" },
      { protocol: "https", hostname: "geprc.com" },
      { protocol: "https", hostname: "**.oss-cn-hongkong.aliyuncs.com" },
      { protocol: "https", hostname: "ueeshop.ly200-cdn.com" },
      { protocol: "https", hostname: "shop.emax-usa.com" },
      { protocol: "https", hostname: "www.racedayquads.com" },
      { protocol: "https", hostname: "static.wixstatic.com" },
      { protocol: "https", hostname: "www.isdt.co" },
      { protocol: "https", hostname: "h2-rd.com" },
      { protocol: "https", hostname: "droneit.se" },
      { protocol: "https", hostname: "gensace.de" },
      { protocol: "https", hostname: "rc-innovations.es" },
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
  output: "export",
  distDir: "dist",
};

export default nextConfig;
