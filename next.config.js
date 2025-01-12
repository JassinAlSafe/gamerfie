/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.igdb.com", "upload.wikimedia.org"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.igdb.com",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
