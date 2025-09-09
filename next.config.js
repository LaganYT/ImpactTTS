/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@andresaya/edge-tts']
  }
}

module.exports = nextConfig
