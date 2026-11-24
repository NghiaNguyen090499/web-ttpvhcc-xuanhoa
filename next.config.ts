/**
 * @nhom        : Config
 * @chucnang    : Cấu hình Next.js — images, webpack, etc.
 * @alias       : next-config
 */

import type { NextConfig } from "next";

function securityHeaders(options: { frameAncestors: "'none'" | "'self'", xFrameOptions: 'DENY' | 'SAMEORIGIN' }) {
  return [
    { key: 'X-Frame-Options', value: options.xFrameOptions },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        // 'unsafe-eval' chỉ cần cho React Refresh ở dev; production không dùng eval / Google Sign-In.
        `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"} https://challenges.cloudflare.com`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "media-src 'self' blob: https:",
        "font-src 'self' data:",
        // Gemini được gọi phía server (/api/chat) nên trình duyệt chỉ cần kết nối same-origin.
        "connect-src 'self'",
        "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://maps.google.com https://challenges.cloudflare.com",
        `frame-ancestors ${options.frameAncestors}`,
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ].join('; '),
    },
    ...(process.env.NODE_ENV === 'production'
      ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
      : []),
  ]
}

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  experimental: {
    // src/proxy.ts bảo vệ /api/admin/*; đặt nhỉnh hơn giới hạn file 300MB để chừa multipart overhead.
    proxyClientMaxBodySize: '310mb',
  },
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: securityHeaders({ frameAncestors: "'self'", xFrameOptions: 'SAMEORIGIN' }),
      },
      {
        source: '/files/:path*',
        headers: securityHeaders({ frameAncestors: "'self'", xFrameOptions: 'SAMEORIGIN' }),
      },
      {
        source: '/((?!uploads/|files/).*)',
        headers: securityHeaders({ frameAncestors: "'none'", xFrameOptions: 'DENY' }),
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
