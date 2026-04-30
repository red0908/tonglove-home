import { useCallback, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { postsApi } from '@/api'
import { Badge, Button, ErrorMessage, PageLoader } from '@/components/ui'
import { PostFormModal } from '@/components/admin/PostFormModal'
import { useAsync } from '@/hooks'
import { formatDate } from '@/utils'
import type { Post } from '@/types'

export function AdminPosts() {
  const fetchPosts = useCallback(() => postsApi.list({ page_size: 50 }), [])
  const { data, loading, error, execute } = useAsync(fetchPosts)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  function openCreate() {
    setEditingPost(null)
    setModalOpen(true)
  }

  function openEdit(post: Post) {
    setEditingPost(post)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingPost(null)
  }

  async function handleSubmit(formData: Partial<Post>) {
    if (editingPost) {
      await postsApi.update(editingPost.id, formData)
    } else {
      await postsApi.create(formData)
    }
    execute()
  }

  async function handleDelete(post: Post) {
    if (!window.confirm(`确定删除博文「${post.title}」？此操作不可恢复。`)) return
    setDeletingId(post.id)
    try {
      await postsApi.remove(post.id)
      execute()
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <PageLoader />
  if (error) return <ErrorMessage message={error} onRetry={execute} />

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">博文管理</h1>
        <Button onClick={openCreate}>
          <Plus size={16} /> 新建博文
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">标题</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">发布时间</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">阅读数</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">状态</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.items.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900 text-sm">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{post.slug}</p>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">
                  {post.published_at ? formatDate(post.published_at) : '—'}
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{post.view_count}</td>
                <td className="px-5 py-4">
                  <Badge variant={post.is_published ? 'success' : 'warning'}>
                    {post.is_published ? '已发布' : '草稿'}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(post)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      title="编辑"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(post)}
                      disabled={deletingId === post.id}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                      title="删除"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!data?.items.length && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                  暂无博文，点击「新建博文」开始写作。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <PostFormModal
          post={editingPost}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
