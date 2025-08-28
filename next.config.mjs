import nextI18NextConfig from './next-i18next.config.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 你的配置
  i18n: nextI18NextConfig.i18n,
  reactStrictMode: false,
};

export default nextConfig;
