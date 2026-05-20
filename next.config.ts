/**
 * @nhom        : Config
 * @chucnang    : Cấu hình Next.js — images, webpack, etc.
 * @alias       : next-config
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Cấu hình Image Optimization */
  images: {
    /* Chất lượng ảnh mặc định — fix warning "Image quality" */
    qualities: [30, 50, 75],
    /* Cho phép tải ảnh từ Facebook CDN nếu cần */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scontent.fhan*.fna.fbcdn.net',
      },
    ],
  },
};

export default nextConfig;
