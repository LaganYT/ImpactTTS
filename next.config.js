/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@andresaya/edge-tts']
  },
  webpack: (config) => {
    config.externals.push({
      '@andresaya/edge-tts': 'commonjs @andresaya/edge-tts'
    });
    return config;
  }
}

module.exports = nextConfig
