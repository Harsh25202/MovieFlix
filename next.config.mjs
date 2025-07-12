/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    'mongodb',
    'bcryptjs',
    '@mongodb-js/zstd',
    'kerberos',
    'mongodb-client-encryption',
    'snappy',
    'socks',
  ],
  appRouter: {
    runtime: 'edge', // Set default runtime to edge for all App Router routes
  }
};

export default nextConfig;
