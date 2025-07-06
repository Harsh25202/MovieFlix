/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'mongodb',
      '@mongodb-js/saslprep',
      'kerberos',
      '@napi-rs/snappy-linux-x64-gnu',
      '@napi-rs/snappy-linux-x64-musl',
      'mongodb-client-encryption'
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle these modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        child_process: false,
        tls: false,
        'util/types': false,
      }
      
      // Exclude MongoDB and related packages from client bundle
      config.externals = [
        ...config.externals,
        'mongodb',
        'mongodb-client-encryption',
        'kerberos',
        '@mongodb-js/saslprep',
        'bson-ext',
        'snappy',
        '@napi-rs/snappy-linux-x64-gnu',
        '@napi-rs/snappy-linux-x64-musl'
      ]
    }
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['m.media-amazon.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/images/**',
      },
    ],
    unoptimized: true,
  },
  // Enable HTTPS in development
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
