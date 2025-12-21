import type { Metadata } from 'next';
import HomeClient from '@/app/[locale]/HomeClient';

type HomePageProps = {
  params: { locale: string };
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const isZh = params.locale === 'zh';
  const title = isZh ? 'History in Art' : 'History in Art';
  const description = 'Art as eyes, witness history';

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `https://www.history-in-art.org/${params.locale}`,
      languages: {
        'zh-CN': 'https://www.history-in-art.org/zh',
        en: 'https://www.history-in-art.org/en',
        'x-default': 'https://www.history-in-art.org/'
      }
    }
  };
}

export default function HomePage() {
  return <HomeClient />;
}
