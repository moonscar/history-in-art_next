import nextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 你的配置
  // i18n: nextI18NextConfig.i18n,
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'commons.wikimedia.org',
        pathname: '/**'
      },
      {
        protocol: 'http',
        hostname: 'upload.wikimedia.org',
        pathname: '/**'
      },
      {
        protocol: 'http',
        hostname: 'commons.wikimedia.org',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**'
      }
    ]
  }
};


const withNextIntl = nextIntlPlugin('./next-intl.config.ts');

export default withNextIntl(nextConfig);
