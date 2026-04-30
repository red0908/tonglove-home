import { ArrowRight, Award, Bot, Brain, Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import { useUiStore } from '@/store'

const HIGHLIGHTS = [
  { icon: Code2, label: '全栈 + AI 经验', value: '8年全栈 · 2年AI落地' },
  { icon: Award, label: '发明专利', value: '3项 · 第一发明人' },
  { icon: Brain, label: '提效成果', value: '60% · 企业创新奖' },
  { icon: Bot, label: '技术栈', value: 'React · FastAPI · LLM' },
]

export function HomePage() {
  const { openAiChat } = useUiStore()

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      {/* Hero */}
      <section className="flex flex-col items-center text-center gap-6 py-16">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center shadow-lg">
          <span className="text-4xl font-bold text-white">张</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            张润桐
          </h1>
          <p className="mt-2 text-xl text-primary-600 font-medium">全栈 AI 开发工程师</p>
        </div>
        <p className="max-w-xl text-lg text-gray-500">
          8年全栈 · 2年AI落地 · 3项发明专利 —— 用工程思维将 AI 从实验室带入生产环境
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-primary-700 active:bg-primary-800"
          >
            查看作品集 <ArrowRight size={16} />
          </Link>
          <Button size="lg" variant="secondary" onClick={openAiChat}>
            <Bot size={16} /> 试试AI助手
          </Button>
        </div>
      </section>

      {/* Highlights */}
      <section className="grid grid-cols-2 gap-4 py-8 sm:grid-cols-4">
        {HIGHLIGHTS.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="flex flex-col items-center gap-2 p-5 text-center">
            <div className="rounded-xl bg-primary-50 p-3">
              <Icon className="h-6 w-6 text-primary-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </Card>
        ))}
      </section>

      {/* Featured Projects Placeholder */}
      <section className="py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">精选项目</h2>
          <Link to="/projects" className="flex items-center gap-1 text-sm text-primary-600 hover:underline">
            查看全部 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} hover className="p-6">
              <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-primary-100 to-violet-100" />
              <h3 className="font-semibold text-gray-900">项目名称 {i}</h3>
              <p className="mt-1 text-sm text-gray-500">项目简介将从 API 动态加载...</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Latest Posts Placeholder */}
      <section className="py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">最新博文</h2>
          <Link to="/posts" className="flex items-center gap-1 text-sm text-primary-600 hover:underline">
            查看全部 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} hover className="p-6">
              <p className="text-xs text-gray-400">2026-0{i}-01 · 5 分钟阅读</p>
              <h3 className="mt-2 font-semibold text-gray-900">博文标题 {i}</h3>
              <p className="mt-1 text-sm text-gray-500">博文摘要将从 API 动态加载...</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
