/** @type {import('next').NextConfig} */
const nextConfig = {
  // Admin uploads (preview images, game.js) go through server actions.
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
  images: {
    domains: ["gotcha.land"],
  },
};

export default nextConfig;
