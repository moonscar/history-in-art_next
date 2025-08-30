import nextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 你的配置
  // i18n: nextI18NextConfig.i18n,
  reactStrictMode: false,
};


const withNextIntl = nextIntlPlugin('./next-intl.config.ts');

export default withNextIntl(nextConfig);