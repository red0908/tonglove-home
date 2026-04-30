import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
      <p className="text-8xl font-bold text-gray-200">404</p>
      <h1 className="text-2xl font-bold text-gray-800">页面不存在</h1>
      <p className="text-gray-500">你访问的页面不见了，可能被 AI 吃掉了。</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700"
      >
        返回首页
      </Link>
    </div>
  )
}
