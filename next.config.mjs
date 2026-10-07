/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],

  webpack: (config, { dev }) => {
    // Webpack's filesystem cache writes several hundred MB of pack files under
    // .next/cache. It only speeds up repeat builds, so it is disabled for
    // production builds to keep the build's disk footprint small.
    if (!dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
