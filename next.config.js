/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    useTypeScriptCli: true,
  },
  serverExternalPackages: ['@andresaya/edge-tts'],
  webpack: (config) => {
    config.externals.push({
      '@andresaya/edge-tts': 'commonjs @andresaya/edge-tts'
    });
    return config;
  }
}

module.exports = nextConfig
