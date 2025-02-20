/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Enables static export for Netlify

  experimental: {
    disableOptimizedLoading: true, // Fixes font loading issues
  },

  images: {
    unoptimized: true, // Disables Next.js image optimization
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.devtool = false; // Disables source maps in production
    }

    config.optimization = {
      ...config.optimization,
      moduleIds: "deterministic",
      minimize: true,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            name: "vendor",
            test: /node_modules/,
            priority: 20,
            chunks: "all",
          },
          common: {
            name: "common",
            minChunks: 2,
            priority: 10,
            chunks: "all",
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
    };

    return config;
  },
};

export default nextConfig;
