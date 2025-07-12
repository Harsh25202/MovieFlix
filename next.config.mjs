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
  ]
};

export default nextConfig;
