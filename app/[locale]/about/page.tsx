// app/[locale]/about/page.tsx
import React from "react";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-8">关于我们 | History-in-Art</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">项目简介</h2>
        <p>
          <strong>History-in-Art</strong>{" "}
          是一个通过艺术作品探索历史的实验性项目。
          我们相信，每一幅画作都不仅是美学的表达，更是一个时代的窗口。
          透过画布上的细节，观者能感受到日常生活的气息，也能触摸到社会变迁与时代脉动。
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">为什么做这个项目</h2>
        <p>
          在互联网上，关于单件艺术品的百科式信息已经非常丰富。
          然而，孤立的条目往往难以传递出作品背后的
          <strong>历史氛围与叙事感</strong>。
        </p>
        <ul className="list-disc pl-6 mt-3 space-y-1">
          <li>将作品放入历史语境中</li>
          <li>用叙事化的方式重现时代风貌</li>
          <li>让用户通过画作感知历史，而不是仅仅“读信息”</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">项目特点</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>故事驱动</strong>：每个专题以一个历史主题为核心，串联起多幅画作。</li>
          <li><strong>跨作品组合</strong>：一段故事中会出现多件艺术品，它们共同勾勒出那个时代的图景。</li>
          <li><strong>历史脉络</strong>：不仅关注艺术本身，也强调作品背后的社会生活与时代差异。</li>
          <li><strong>技术探索</strong>：我们尝试利用 AI 技术，帮助自动生成主题与筛选作品，加速历史与艺术之间的联结。</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">谁在做</h2>
        <p>
          这个项目目前由 <strong>个人独立完成</strong>，处于持续开发与迭代阶段。
          未来，我们希望 History-in-Art 能吸引更多研究者、艺术爱好者与开发者的加入，一起拓展更多功能与故事。
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">如何使用</h2>
        <p>在网站上，您可以：</p>
        <ul className="list-disc pl-6 mt-3 space-y-1">
          <li>
            在 <strong>故事页面</strong> 中，跟随一个主题，透过画作与文字叙事，走进一个历史瞬间。
          </li>
          <li>
            在 <strong>画作页面</strong>，单独查看作品细节与相关背景。
          </li>
          <li>我们会不断更新新的故事主题，帮助您从不同角度探索艺术与历史的交织。</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">愿景与未来</h2>
        <p>
          History-in-Art 希望成为一个桥梁，让艺术不再只是展馆里的静止影像，
          而是能 <strong>连接过去与现在</strong>、<strong>个人与社会</strong> 的鲜活故事。
        </p>
        <p className="mt-2">未来计划包括：</p>
        <ul className="list-disc pl-6 mt-3 space-y-1">
          <li>更丰富的交互体验（如地图、时间轴）</li>
          <li>个性化收藏与分享功能</li>
          <li>面向公众的故事创作与投稿机制</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">联系我</h2>
        <p>
          如果您对项目有任何建议或想法，欢迎联系：
          <br />
          📧 <a href="feedback@history-in-art.org"
          className="text-blue-600 hover:underline">your@email.com</a>
        </p>
      </section>
    </div>
  );
}