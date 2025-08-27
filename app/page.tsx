// app/page.tsx - 主页面容器
'use client'

// import App from '@/components/App'
import dynamic from 'next/dynamic'
import I18nProvider from '@/components/I18nProvider'

const App = dynamic(() => import('@/components/App'), {
  ssr: false
})

export default function HomePage() {
  return (
    <I18nProvider>
      <App />
    </I18nProvider>
  )
}