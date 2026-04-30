import { BookOpen, Database, FolderOpen, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

const QUICK_LINKS = [
  { to: '/admin/projects', icon: FolderOpen, label: '作品管理', color: 'bg-blue-50 text-blue-600' },
  { to: '/admin/posts', icon: BookOpen, label: '博文管理', color: 'bg-green-50 text-green-600' },
  { to: '/admin/knowledge', icon: Database, label: '知识库', color: 'bg-violet-50 text-violet-600' },
  { to: '/admin/comments', icon: MessageSquare, label: '评论审核', color: 'bg-amber-50 text-amber-600' },
]

export function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="mt-1 text-gray-500">欢迎回来！在此管理你的个人官网内容。</p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map(({ to, icon: Icon, label, color }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
          >
            <div className={`rounded-xl p-3 ${color}`}>
              <Icon size={20} />
            </div>
            <span className="font-medium text-gray-900">{label}</span>
          </Link>
        ))}
      </div>

      {/* Placeholder Stats */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">数据概览</h2>
        <p className="text-sm text-gray-400">统计数据将在后端 API 接入后展示。</p>
      </div>
    </div>
  )
}
