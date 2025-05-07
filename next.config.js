/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  serverRuntimeConfig: {
    // Переменные доступные только на сервере
  },
  publicRuntimeConfig: {
    // Переменные доступные на клиенте и сервере
  },
  // Проверяем совместимость с Vercel
  experimental: {
    // serverActions: true,
  }
}

module.exports = nextConfig