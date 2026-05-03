import { useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Award, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Badge, Button, ErrorMessage, PageLoader } from '@/components/ui'
import { projectsApi } from '@/api'
import { useAsync } from '@/hooks'
import { useUiStore } from '@/store'

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { openAiChat } = useUiStore()

  const fetchProject = useCallback(
    () => projectsApi.getBySlug(slug!),
    [slug]
  )
  const { data: project, loading, error, execute } = useAsync(fetchProject)

  if (loading) return <PageLoader />
  if (error || !project) return <ErrorMessage message={error ?? '项目不存在'} onRetry={execute} />

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft size={14} /> 返回作品集
      </Link>

      {/* Cover */}
      {project.cover_url ? (
        <img src={project.cover_url} alt={project.title} className="mb-8 h-72 w-full rounded-2xl object-cover" />
      ) : (
        <div className="mb-8 h-72 w-full rounded-2xl bg-gradient-to-br from-primary-100 to-violet-100" />
      )}

      {/* Title & Tags */}
      <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        {project.tech_tags.map((tag) => (
          <Badge key={tag} variant="primary">{tag}</Badge>
        ))}
      </div>

      {/* Summary */}
      <p className="mt-4 text-lg text-gray-600">{project.summary}</p>

      {/* Metrics */}
      {project.metrics && (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {Object.entries(project.metrics).map(([key, val]) => val && (
            <div key={key} className="rounded-xl border border-primary-100 bg-primary-50 p-4 text-center">
              <p className="text-xl font-bold text-primary-700">{val}</p>
              <p className="text-sm text-gray-500">{key}</p>
            </div>
          ))}
        </div>
      )}

      {/* Patent */}
      {project.patent_info && (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
          <Award className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold text-gray-900">{project.patent_info.name}</p>
            <p className="text-sm text-gray-600">
              状态：{project.patent_info.status} ·{' '}
              {project.patent_info.is_first_inventor ? '第一发明人' : '参与发明人'}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-gray mt-10 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.content}</ReactMarkdown>
      </div>

      {/* AI Demo CTA */}
      <div className="mt-12 flex justify-center">
        <Button onClick={openAiChat} size="lg">
          <Bot size={18} /> 体验 AI 功能
        </Button>
      </div>
    </div>
  )
}
