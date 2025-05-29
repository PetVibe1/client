import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Thêm cấu hình API proxy
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
