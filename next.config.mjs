/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['image.tmdb.org', 'via.placeholder.com'],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Exclude MongoDB from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        child_process: false,
        tls: false,
        mongodb: false,
        'mongodb-client-encryption': false,
        '@mongodb-js/zstd': false,
        'kerberos': false,
        'snappy': false,
        '@aws-sdk/credential-providers': false,
        'gcp-metadata': false,
        'socks': false,
      }
    }
    
    // Externalize MongoDB for server-side
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        'mongodb': 'commonjs mongodb',
        'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
        '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
        'kerberos': 'commonjs kerberos',
        'snappy': 'commonjs snappy',
        '@aws-sdk/credential-providers': 'commonjs @aws-sdk/credential-providers',
        'gcp-metadata': 'commonjs gcp-metadata',
        'socks': 'commonjs socks',
      })
    }
    
    return config
  },
}

export default nextConfig
