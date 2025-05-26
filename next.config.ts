import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Disabled ESLint for production build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // Disabled TypeScript type checking for production build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  
  // Thêm cấu hình API proxy nếu cần
  // Bỏ comment để kích hoạt proxy API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://server-wv4w.onrender.com/api/:path*',
      },
    ];
  },
  
  // Thêm cấu hình cho images
  images: {
    domains: ['i.imgur.com', 'localhost', 'res.cloudinary.com'],
  },
  webpack: (config, { isServer }) => {
    // If client-side, ignore socket.io-client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        fs: false,
        tls: false,
        'socket.io-client': false,
      };
    }
    return config;
  },
};

export default nextConfig;
