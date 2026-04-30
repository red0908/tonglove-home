import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Brain,
  ChevronLeft,
  Database,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Menu,
} from 'lucide-react'
import { authApi } from '@/api'
import { useAuthStore } from '@/store'
import { cn } from '@/utils'

const ADMIN_NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/admin/projects', icon: FolderOpen, label: '作品管理' },
  { to: '/admin/posts', icon: BookOpen, label: '博文管理' },
  { to: '/admin/knowledge', icon: Database, label: '知识库' },
  { to: '/admin/comments', icon: MessageSquare, label: '评论审核' },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    logout()
    navigate('/admin/login')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-shrink-0 flex-col border-r border-gray-200 bg-white transition-all duration-200',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          {!collapsed && (
            <Link to="/" className="font-bold text-gray-900">
              <Brain className="inline-block h-5 w-5 text-primary-600" />
              <span className="ml-1.5 gradient-text">TongAI</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <div className="flex flex-col gap-1">
            {ADMIN_NAV.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={navLinkClass} title={collapsed ? label : undefined}>
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-100 px-2 py-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            title={collapsed ? '退出登录' : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
