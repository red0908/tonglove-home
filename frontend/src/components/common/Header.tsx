import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Bot, Menu, Moon, Sun, X } from 'lucide-react'
import { useUiStore } from '@/store'
import { cn } from '@/utils'

const NAV_LINKS = [
  { to: '/', label: '首页' },
  { to: '/projects', label: '作品集' },
  { to: '/posts', label: '博文' },
  { to: '/ai', label: 'AI体验' },
  { to: '/about', label: '关于我' },
]

export function Header() {
  const { theme, toggleTheme, openAiChat } = useUiStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors',
      isActive
        ? 'text-primary-600'
        : 'text-gray-600 hover:text-gray-900'
    )

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-gray-900">
          <span className="gradient-text text-lg">TongAI</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={navLinkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={openAiChat}
            title="打开AI助手"
            className="hidden items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-primary-700 sm:flex"
          >
            <Bot size={15} />
            试试AI
          </button>

          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
            title="切换主题"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={navLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
