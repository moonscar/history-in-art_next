// app/page.tsx - 主页面容器
'use client'

// import App from '@/components/App'
import dynamic from 'next/dynamic'

const App = dynamic(() => import('@/components/App'), {
  ssr: false
})

export default function HomePage() {
  return (
    <App />
  )
}