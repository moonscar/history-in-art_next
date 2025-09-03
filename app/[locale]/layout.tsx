// app/layout.tsx - 基础布局
import type { Metadata } from "next";
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import '../globals.css';
import 'leaflet/dist/leaflet.css';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script';


export const metadata: Metadata = {
  title: "History in Art",
  description: "Art as eyes, witness history",
};

export default async function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  let messages;
  try {
    messages = (await import(`../../lib/locales/${locale}/translation.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Analytics />
        </NextIntlClientProvider>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6333474665018049"
          crossOrigin="anonymous" // 2. Correct attribute name to `crossOrigin`
          strategy="lazyOnload" // 3. Use `strategy` prop for better performance
        />
      </body>
    </html>
  );
}
