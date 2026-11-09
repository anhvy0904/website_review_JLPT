/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // Khắc phục triệt để lỗi Windows file locking khi rename .pack.gz_ trong Webpack PackFileCacheStrategy
      config.cache = {
        type: "memory",
      };
    }
    return config;
  },
};

export default nextConfig;

