/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongodb'],
  },
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
  // Ensure Edge Runtime compatibility
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle MongoDB and other Node.js modules for server-side rendering
      config.externals = config.externals || []
      config.externals.push({
        'mongodb': 'commonjs mongodb',
        'bcryptjs': 'commonjs bcryptjs',
        'jsonwebtoken': 'commonjs jsonwebtoken',
      })
    }
    return config
  },
}

export default nextConfig
