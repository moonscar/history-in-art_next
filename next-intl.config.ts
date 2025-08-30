import {getRequestConfig} from 'next-intl/server';
import {routing} from './lib/i18n';

export default getRequestConfig(async ({locale}) => {
  const validLocale = locale && routing.locales.includes(locale as any) 
    ? locale 
    : routing.defaultLocale;
  
  return {
    locale: validLocale, // 关键：必须显式返回 locale
    messages: (await import(`./lib/locales/${validLocale}/translation.json`)).default
  };
});