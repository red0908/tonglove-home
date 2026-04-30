import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui'
import { slugify } from '@/utils'
import type { Post } from '@/types'

interface PostFormData {
  title: string
  slug: string
  summary: string
  content: string
  tags: string          // 逗号分隔，提交时转数组
  is_published: boolean
  published_at: string  // datetime-local 格式
}

interface PostFormModalProps {
  post?: Post | null    // 有值则为编辑模式，null/undefined 为新建模式
  onClose: () => void
  onSubmit: (data: Partial<Post>) => Promise<void>
}

const EMPTY: PostFormData = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  tags: '',
  is_published: false,
  published_at: '',
}

function toLocalDatetime(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function PostFormModal({ post, onClose, onSubmit }: PostFormModalProps) {
  const [form, setForm] = useState<PostFormData>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const isEdit = !!post

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title,
        slug: post.slug,
        summary: post.summary ?? '',
        content: post.content ?? '',
        tags: (post.tags ?? []).join(', '),
        is_published: post.is_published,
        published_at: toLocalDatetime(post.published_at),
      })
    } else {
      setForm(EMPTY)
    }
    setTimeout(() => titleRef.current?.focus(), 50)
  }, [post])

  function set<K extends keyof PostFormData>(key: K, value: PostFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleTitleChange(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
      // 新建时自动生成 slug，编辑时不覆盖
      slug: isEdit ? f.slug : slugify(value),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('标题不能为空'); return }
    if (!form.slug.trim()) { setError('Slug 不能为空'); return }
    setError(null)
    setSubmitting(true)
    try {
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      const published_at = form.is_published && !form.published_at
        ? new Date().toISOString()
        : form.published_at
          ? new Date(form.published_at).toISOString()
          : undefined
      await onSubmit({
        title: form.title.trim(),
        slug: form.slug.trim(),
        summary: form.summary.trim() || undefined,
        content: form.content.trim() || undefined,
        tags,
        is_published: form.is_published,
        published_at: published_at ?? null,
      } as Partial<Post>)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? '编辑博文' : '新建博文'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          {/* 标题 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">标题 *</label>
            <input
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="博文标题"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Slug *
              <span className="ml-2 font-normal text-gray-400 text-xs">（用于 URL，如：my-first-post）</span>
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="url-friendly-slug"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono text-gray-900 placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {/* 摘要 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">摘要</label>
            <textarea
              value={form.summary}
              onChange={(e) => set('summary', e.target.value)}
              placeholder="一句话描述文章内容（可选）"
              rows={2}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {/* 正文 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              正文
              <span className="ml-2 font-normal text-gray-400 text-xs">（支持 Markdown）</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              placeholder="# 标题&#10;&#10;在这里写你的文章..."
              rows={12}
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-2.5 font-mono text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {/* 标签 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              标签
              <span className="ml-2 font-normal text-gray-400 text-xs">（逗号分隔，如：AI, FastAPI）</span>
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              placeholder="AI, FastAPI, React"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {/* 发布设置 */}
          <div className="flex flex-wrap items-center gap-6 rounded-xl bg-gray-50 px-4 py-3">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => set('is_published', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-primary-600"
              />
              <span className="text-sm font-medium text-gray-700">立即发布</span>
            </label>
            {form.is_published && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">发布时间</label>
                <input
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(e) => set('published_at', e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-primary-500"
                />
                <span className="text-xs text-gray-400">留空则为当前时间</span>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              取消
            </Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? '保存修改' : '创建博文'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
