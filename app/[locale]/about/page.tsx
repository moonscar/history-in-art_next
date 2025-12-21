import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type AboutPageProps = {
  params: { locale: string };
};

export default function AboutPage({ params }: AboutPageProps) {
  const isZh = params.locale === 'zh';

  const title = isZh ? '关于我们 | History in Art' : 'About | History in Art';
  const introTitle = isZh ? '项目简介' : 'What this is';
  const introBody = isZh
    ? 'History in Art 是一个通过艺术作品探索历史的实验性项目。我们相信，每一幅画作都不仅是美学的表达，更是一个时代的窗口。'
    : 'History in Art is an experimental project that explores history through artworks. We believe each painting is not only an aesthetic expression, but also a window into its time.';

  const whyTitle = isZh ? '为什么做这个项目' : 'Why we built it';
  const whyBody = isZh
    ? '互联网上关于单件艺术品的百科式信息已经很丰富，但孤立的条目往往难以传递作品背后的历史氛围与叙事感。'
    : 'Encyclopedic information about individual artworks is abundant online, but isolated entries often fail to convey the historical atmosphere and narrative behind the work.';
  const whyList = isZh
    ? ['将作品放入历史语境中', '用叙事化的方式重现时代风貌', '让用户通过画作感知历史，而不是仅仅“读信息”']
    : ['Place artworks back into historical context', 'Reconstruct the vibe of an era through narrative', 'Help people feel history through images, not just read facts'];

  const featuresTitle = isZh ? '项目特点' : 'What you can do here';
  const featuresList = isZh
    ? [
        '地图与时间轴：在地理与时间维度中浏览作品。',
        '主题与故事：用更可读的方式组织作品，帮助快速理解背景。',
        '收藏与探索：把感兴趣的作品加入 Gallery 进一步对比与回看。'
      ]
    : [
        'Map + timeline: browse artworks by geography and time.',
        'Themes + stories: organize artworks into readable narratives.',
        'Save and explore: collect favorites in the Gallery for later.'
      ];

  const contactTitle = isZh ? '联系我' : 'Contact';
  const contactBody = isZh
    ? '如果你对项目有任何建议或想法，欢迎邮件联系：'
    : 'If you have any feedback or ideas, feel free to email:';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <header className="bg-black/20 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            {isZh ? '返回主页' : 'Back to Home'}
          </Link>

          <h1 className="text-4xl font-bold text-white text-center">{title}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 text-gray-200">
        <section className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{introTitle}</h2>
          <p className="text-gray-300 leading-relaxed">{introBody}</p>
        </section>

        <section className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{whyTitle}</h2>
          <p className="text-gray-300 leading-relaxed mb-4">{whyBody}</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            {whyList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{featuresTitle}</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            {featuresList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">{contactTitle}</h2>
          <p className="text-gray-300 leading-relaxed mb-2">{contactBody}</p>
          <a
            href="mailto:feedback@history-in-art.org"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
          >
            feedback@history-in-art.org
          </a>
        </section>
      </main>
    </div>
  );
}
