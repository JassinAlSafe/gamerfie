/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',  // Google auth profile pictures
      'images.igdb.com',           // IGDB game images
      'avatars.githubusercontent.com'  // GitHub profile pictures
    ],
    unoptimized: true  // Optional: if you want to disable image optimization
  },
  reactStrictMode: true,
  experimental: {
    serverActions: true
  }
}

module.exports = nextConfig 