/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // This wildcard allows images from ANY secure https:// website
      },
    ],
  },
};

export default nextConfig;