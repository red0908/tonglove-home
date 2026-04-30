import { useCallback, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { knowledgeApi } from '@/api'
import { Button, ErrorMessage, PageLoader } from '@/components/ui'
import { useAsync } from '@/hooks'

export function AdminKnowledge() {
  const fetchDocs = useCallback(() => knowledgeApi.list(), [])
  const { data, loading, error, execute } = useAsync(fetchDocs)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await knowledgeApi.create({ title, content })
      setTitle('')
      setContent('')
      setShowForm(false)
      execute()
    } catch {
      alert('创建失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />
  if (error) return <ErrorMessage message={error} onRetry={execute} />

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">知识库管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理 RAG 问答所使用的知识文档</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus size={16} /> 添加文档
        </Button>
      </div>

      {/* New Doc Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-primary-200 bg-primary-50 p-5">
          <h2 className="mb-4 font-semibold text-gray-900 text-sm">新建知识文档</h2>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="文档标题（如：个人技术背景）"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            <textarea
              placeholder="文档内容..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>取消</Button>
              <Button type="submit" loading={saving}>保存</Button>
            </div>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-4">
        {data?.map((doc) => (
          <div key={doc.id} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-3">{doc.content}</p>
              </div>
              <button
                onClick={async () => {
                  if (confirm('确定删除此文档？')) {
                    await knowledgeApi.remove(doc.id)
                    execute()
                  }
                }}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {!data?.length && !showForm && (
          <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
            暂无知识文档，点击「添加文档」开始构建知识库。
          </div>
        )}
      </div>
    </div>
  )
}
