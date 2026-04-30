import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GithubIcon, LinkedinIcon } from '@/components/ui/BrandIcons'

const SOCIAL_LINKS = [
  { href: 'https://github.com/', icon: GithubIcon, label: 'GitHub' },
  { href: 'https://linkedin.com/', icon: LinkedinIcon, label: 'LinkedIn' },
  { href: 'mailto:hello@example.com', icon: Mail, label: '邮箱' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="text-center sm:text-left">
          <p className="font-semibold text-gray-900">张润桐</p>
          <p className="mt-0.5 text-sm text-gray-500">全栈 AI 开发工程师 · 8年经验 · 3项发明专利</p>
        </div>

        <div className="flex items-center gap-2">
          {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>

        <p className="text-xs text-gray-400">
          © {year} · Built with React + FastAPI ·{' '}
          <Link to="/admin/login" className="hover:text-gray-600">
            管理后台
          </Link>
        </p>
      </div>
    </footer>
  )
}
