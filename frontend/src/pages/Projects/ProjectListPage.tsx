import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Card, ErrorMessage, PageLoader } from '@/components/ui'
import { projectsApi } from '@/api'
import { useAsync } from '@/hooks'

export function ProjectListPage() {
  const fetchProjects = useCallback(() => projectsApi.list(), [])
  const { data, loading, error, execute } = useAsync(fetchProjects)

  if (loading) return <PageLoader />
  if (error) return <ErrorMessage message={error} onRetry={execute} />

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">作品集</h1>
        <p className="mt-2 text-gray-500">AI 项目、专利成果与技术实践</p>
      </div>

      {data && data.items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((project) => (
            <Link key={project.id} to={`/projects/${project.slug}`}>
              <Card hover className="flex h-full flex-col">
                {project.cover_url && (
                  <img
                    src={project.cover_url}
                    alt={project.title}
                    className="h-44 w-full object-cover"
                  />
                )}
                {!project.cover_url && (
                  <div className="h-44 bg-gradient-to-br from-primary-100 to-violet-100" />
                )}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h2 className="font-semibold text-gray-900">{project.title}</h2>
                  <p className="text-sm text-gray-500 flex-1">{project.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {project.tech_tags.map((tag) => (
                      <Badge key={tag} variant="primary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-gray-400">暂无已发布项目</div>
      )}
    </div>
  )
}
