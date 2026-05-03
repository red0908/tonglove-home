import { ArrowRight, Award, Bot, Brain, Code2, Mail, ExternalLink } from 'lucide-react'
import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi } from '@/api/projects'
import { postsApi } from '@/api/posts'
import { useAsync } from '@/hooks/useAsync'
import { Button, Card } from '@/components/ui'
import { useUiStore } from '@/store'
import type { Project, Post } from '@/types'

const HIGHLIGHTS = [
  { icon: Code2, label: '全栈 + AI 经验', value: '8年全栈 · 2年AI落地' },
  { icon: Award, label: '发明专利', value: '3项 · 第一发明人' },
  { icon: Brain, label: '提效成果', value: '60% · 企业创新奖' },
  { icon: Bot, label: '技术栈', value: 'React · FastAPI · LLM' },
]

function ProjectSkeleton() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="mb-4 h-32 rounded-xl bg-gray-100" />
      <div className="h-4 w-3/4 rounded bg-gray-100 mb-2" />
      <div className="h-3 w-full rounded bg-gray-100" />
    </Card>
  )
}

function PostSkeleton() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="h-3 w-1/3 rounded bg-gray-100 mb-3" />
      <div className="h-4 w-3/4 rounded bg-gray-100 mb-2" />
      <div className="h-3 w-full rounded bg-gray-100" />
    </Card>
  )
}

export function HomePage() {
  const { openAiChat } = useUiStore()

  const fetchProjects = useCallback(() => projectsApi.list({ page_size: 3 }), [])
  const fetchPosts = useCallback(() => postsApi.list({ page_size: 2 }), [])

  const { data: projectsData, loading: projectsLoading } = useAsync(fetchProjects)
  const { data: postsData, loading: postsLoading } = useAsync(fetchPosts)

  const projects: Project[] = projectsData?.items ?? []
  const posts: Post[] = postsData?.items ?? []

  return (
    <div>
      {/* Hero — 全宽背景 */}
      <style>{`
        @keyframes heroGradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-animated-bg {
          background: linear-gradient(130deg, #e0e7ff, #ede9fe, #fce7f3, #dbeafe, #ede9fe, #e0e7ff);
          background-size: 400% 400%;
          animation: heroGradient 8s ease infinite;
        }
      `}</style>
      <section className="hero-animated-bg relative overflow-hidden px-4 py-24 sm:px-6">
        {/* 点阵纹理 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* 内容 */}
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center gap-6">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center shadow-xl ring-4 ring-white/60">
            <span className="text-4xl font-bold text-white">彤</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              彤爱
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
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

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

      {/* Featured Projects */}
      <section className="py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">精选项目</h2>
          <Link to="/projects" className="flex items-center gap-1 text-sm text-primary-600 hover:underline">
            查看全部 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {projectsLoading
            ? [1, 2, 3].map((i) => <ProjectSkeleton key={i} />)
            : projects.length > 0
              ? projects.map((project) => (
                  <Link key={project.id} to={`/projects/${project.slug}`}>
                    <Card hover className="p-6 h-full">
                      {project.cover_url ? (
                        <img
                          src={project.cover_url}
                          alt={project.title}
                          className="mb-4 h-32 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-primary-100 to-violet-100" />
                      )}
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.summary}</p>
                      {project.tech_tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {project.tech_tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  </Link>
                ))
              : (
                <p className="col-span-3 text-center text-gray-400 py-8">暂无项目</p>
              )
          }
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">最新博文</h2>
          <Link to="/posts" className="flex items-center gap-1 text-sm text-primary-600 hover:underline">
            查看全部 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {postsLoading
            ? [1, 2].map((i) => <PostSkeleton key={i} />)
            : posts.length > 0
              ? posts.map((post) => (
                  <Link key={post.id} to={`/posts/${post.slug}`}>
                    <Card hover className="p-6 h-full">
                      <p className="text-xs text-gray-400">
                        {new Date(post.published_at).toLocaleDateString('zh-CN')}
                        {post.tags.length > 0 && ` · ${post.tags[0]}`}
                      </p>
                      <h3 className="mt-2 font-semibold text-gray-900">{post.title}</h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{post.summary}</p>
                    </Card>
                  </Link>
                ))
              : (
                <p className="col-span-2 text-center text-gray-400 py-8">暂无博文</p>
              )
          }
        </div>
      </section>
      {/* CTA Banner */}
      <section className="py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-violet-600 to-purple-700 px-8 py-16 text-center shadow-xl">
          {/* 动画装饰球 */}
          <div
            className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl animate-pulse"
            style={{ animationDuration: '6s', animationDelay: '1s' }}
          />
          <div
            className="absolute top-1/2 left-1/3 h-48 w-48 -translate-y-1/2 rounded-full bg-primary-300/15 blur-2xl animate-pulse"
            style={{ animationDuration: '5s', animationDelay: '2s' }}
          />

          {/* 内容 */}
          <div className="relative z-10 flex flex-col items-center gap-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              目前开放合作与内推
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              让我们一起构建下一个 AI 产品
            </h2>
            <p className="max-w-lg text-base text-white/75">
              无论是技术合作、项目外包，还是只是想聊聊 AI 工程化，都欢迎联系我。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="mailto:zhangruntong@example.com"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-primary-700 shadow-lg transition hover:bg-primary-50 active:scale-95"
              >
                <Mail size={16} /> 发邮件联系
              </a>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-base font-medium text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
              >
                <ExternalLink size={16} /> GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}
