import { useCallback } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { projectsApi } from '@/api'
import { Button, Badge, ErrorMessage, PageLoader } from '@/components/ui'
import { useAsync } from '@/hooks'

export function AdminProjects() {
  const fetchProjects = useCallback(() => projectsApi.list({ page_size: 50 }), [])
  const { data, loading, error, execute } = useAsync(fetchProjects)

  if (loading) return <PageLoader />
  if (error) return <ErrorMessage message={error} onRetry={execute} />

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">作品管理</h1>
        <Button>
          <Plus size={16} /> 新建项目
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">项目标题</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">技术标签</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">状态</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.items.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900 text-sm">{project.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{project.slug}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {project.tech_tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="primary">{tag}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Badge variant={project.is_published ? 'success' : 'warning'}>
                    {project.is_published ? '已发布' : '草稿'}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                      <Pencil size={15} />
                    </button>
                    <button className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!data?.items.length && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-sm text-gray-400">
                  暂无项目，点击「新建项目」开始添加。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
