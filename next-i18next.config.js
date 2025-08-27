/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
  },
  localePath: './public/locales', // 默认就是 public/locales
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};