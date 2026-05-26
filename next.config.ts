/**
 * @nhom        : Config
 * @chucnang    : Cấu hình Next.js — images, webpack, etc.
 * @alias       : next-config
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://generativelanguage.googleapis.com https://oauth2.googleapis.com https://www.googleapis.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          ...(process.env.NODE_ENV === 'production'
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
            : []),
        ],
      },
    ]
  },
  /* Cấu hình Image Optimization */
  images: {
    /* Chất lượng ảnh mặc định — fix warning "Image quality" */
    qualities: [30, 50, 75, 90],
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
