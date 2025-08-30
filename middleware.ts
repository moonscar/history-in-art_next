import createMiddleware from 'next-intl/middleware';
import {routing} from './lib/i18n';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/((?!_next|_vercel|api|favicon.ico|.*\\..*).*)' 
  ]
};

