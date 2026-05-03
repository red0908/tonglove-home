import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, ImagePlus, Loader, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { uploadApi } from '@/api'
import { slugify } from '@/utils'
import type { Project } from '@/types'

interface ProjectFormData {
  title: string
  slug: string
  summary: string
  content: string
  cover_url: string
  tech_tags: string       // 逗号分隔
  sort_order: number
  is_published: boolean
  // 专利
  patent_name: string
  patent_status: string
  patent_is_first: boolean
  has_patent: boolean
  // 量化指标
  metric_efficiency: string
  metric_award: string
  metric_coverage: string
}

interface ProjectFormModalProps {
  project?: Project | null
  onClose: () => void
  onSubmit: (data: Partial<Project>) => Promise<void>
}

const EMPTY: ProjectFormData = {
  title: '', slug: '', summary: '', content: '', cover_url: '',
  tech_tags: '', sort_order: 0, is_published: false,
  patent_name: '', patent_status: '申请中', patent_is_first: true, has_patent: false,
  metric_efficiency: '', metric_award: '', metric_coverage: '',
}

export function ProjectFormModal({ project, onClose, onSubmit }: ProjectFormModalProps) {
  const [form, setForm] = useState<ProjectFormData>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadApi.image(file)
      set('cover_url', url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片上传失败')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }
  const titleRef = useRef<HTMLInputElement>(null)
  const isEdit = !!project

  useEffect(() => {
    if (project) {
      const p = project.patent_info
      const m = project.metrics
      setForm({
        title: project.title,
        slug: project.slug,
        summary: project.summary ?? '',
        content: project.content ?? '',
        cover_url: project.cover_url ?? '',
        tech_tags: (project.tech_tags ?? []).join(', '),
        sort_order: project.sort_order ?? 0,
        is_published: project.is_published,
        has_patent: !!p,
        patent_name: p?.name ?? '',
        patent_status: p?.status ?? '申请中',
        patent_is_first: p?.is_first_inventor ?? true,
        metric_efficiency: m?.efficiency ?? '',
        metric_award: m?.award ?? '',
        metric_coverage: m?.coverage ?? '',
      })
    } else {
      setForm(EMPTY)
    }
    setTimeout(() => titleRef.current?.focus(), 50)
  }, [project])

  function set<K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleTitleChange(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
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
      const tech_tags = form.tech_tags.split(',').map((t) => t.trim()).filter(Boolean)
      const patent_info = form.has_patent && form.patent_name.trim()
        ? { name: form.patent_name.trim(), status: form.patent_status, is_first_inventor: form.patent_is_first }
        : null
      const metrics: Record<string, string> = {}
      if (form.metric_efficiency) metrics.efficiency = form.metric_efficiency
      if (form.metric_award) metrics.award = form.metric_award
      if (form.metric_coverage) metrics.coverage = form.metric_coverage

      await onSubmit({
        title: form.title.trim(),
        slug: form.slug.trim(),
        summary: form.summary.trim() || undefined,
        content: form.content.trim() || undefined,
        cover_url: form.cover_url.trim() || undefined,
        tech_tags,
        sort_order: form.sort_order,
        is_published: form.is_published,
        patent_info: patent_info as Project['patent_info'],
        metrics: Object.keys(metrics).length ? metrics : null,
      } as Partial<Project>)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? '编辑项目' : '新建项目'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          {/* 标题 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">项目标题 *</label>
            <input ref={titleRef} type="text" value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="例：AI 智能质检系统" className={inputCls} />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Slug *
              <span className="ml-2 font-normal text-gray-400 text-xs">（URL 标识，建议英文）</span>
            </label>
            <input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value)}
              placeholder="ai-quality-inspection" className={`${inputCls} font-mono`} />
          </div>

          {/* 简介 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">项目简介</label>
            <textarea value={form.summary} onChange={(e) => set('summary', e.target.value)}
              placeholder="一句话描述项目价值" rows={2}
              className={`${inputCls} resize-none`} />
          </div>

          {/* 详情 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              详情内容
              <span className="ml-2 font-normal text-gray-400 text-xs">（支持 Markdown）</span>
            </label>
            <textarea value={form.content} onChange={(e) => set('content', e.target.value)}
              placeholder="## 项目背景&#10;&#10;详细描述项目背景、技术方案、成果..." rows={10}
              className={`${inputCls} resize-y font-mono`} />
          </div>

          {/* 封面图 & 标签 并排 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">封面图</label>
              {/* 预览 */}
              {form.cover_url && (
                <div className="relative mb-2 h-28 w-full overflow-hidden rounded-xl border border-gray-200">
                  <img src={form.cover_url} alt="封面预览" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => set('cover_url', '')}
                    className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {/* 上传区 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.cover_url}
                  onChange={(e) => set('cover_url', e.target.value)}
                  placeholder="https://... 或点击上传"
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  {uploading
                    ? <Loader size={15} className="animate-spin" />
                    : <ImagePlus size={15} />}
                  {uploading ? '上传中' : '上传'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                技术标签
                <span className="ml-1 font-normal text-gray-400 text-xs">（逗号分隔）</span>
              </label>
              <input type="text" value={form.tech_tags} onChange={(e) => set('tech_tags', e.target.value)}
                placeholder="React, FastAPI, AI" className={inputCls} />
            </div>
          </div>

          {/* 高级选项折叠 */}
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <button type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
              <span>高级选项（专利信息 / 量化指标 / 排序）</span>
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showAdvanced && (
              <div className="space-y-4 border-t border-gray-100 px-4 py-4">
                {/* 量化指标 */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">量化指标</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">提效幅度</label>
                      <input type="text" value={form.metric_efficiency}
                        onChange={(e) => set('metric_efficiency', e.target.value)}
                        placeholder="60%" className={inputCls} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">获奖 / 荣誉</label>
                      <input type="text" value={form.metric_award}
                        onChange={(e) => set('metric_award', e.target.value)}
                        placeholder="企业创新奖" className={inputCls} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">覆盖规模</label>
                      <input type="text" value={form.metric_coverage}
                        onChange={(e) => set('metric_coverage', e.target.value)}
                        placeholder="10万+ 数据" className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* 专利信息 */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">专利信息</p>
                  <label className="mb-3 flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={form.has_patent}
                      onChange={(e) => set('has_patent', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 accent-primary-600" />
                    <span className="text-sm text-gray-600">该项目包含专利</span>
                  </label>
                  {form.has_patent && (
                    <div className="space-y-3 rounded-xl bg-gray-50 p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs text-gray-500">专利名称</label>
                          <input type="text" value={form.patent_name}
                            onChange={(e) => set('patent_name', e.target.value)}
                            placeholder="一种…的方法" className={inputCls} />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-gray-500">专利状态</label>
                          <select value={form.patent_status}
                            onChange={(e) => set('patent_status', e.target.value)}
                            className={inputCls}>
                            <option>申请中</option>
                            <option>已授权</option>
                            <option>已公开</option>
                          </select>
                        </div>
                      </div>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input type="checkbox" checked={form.patent_is_first}
                          onChange={(e) => set('patent_is_first', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 accent-primary-600" />
                        <span className="text-sm text-gray-600">本人为第一发明人</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* 排序 */}
                <div className="w-32">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    排序权重
                    <span className="ml-1 font-normal text-gray-400 text-xs">（越大越靠前）</span>
                  </label>
                  <input type="number" value={form.sort_order}
                    onChange={(e) => set('sort_order', Number(e.target.value))}
                    className={inputCls} />
                </div>
              </div>
            )}
          </div>

          {/* 发布 */}
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input type="checkbox" checked={form.is_published}
                onChange={(e) => set('is_published', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-primary-600" />
              <span className="text-sm font-medium text-gray-700">发布到前台展示</span>
            </label>
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>取消</Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? '保存修改' : '创建项目'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
