/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'avatars.githubusercontent.com',
      'api.dicebear.com',
      'ui-avatars.com',
    ],
  },
  // Allow both .tsx pages in the same RSC setup
  experimental: {},
}

module.exports = nextConfig
