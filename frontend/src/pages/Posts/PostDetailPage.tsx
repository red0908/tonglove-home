import { useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, Eye, Send } from 'lucide-react'
import { Badge, Button, ErrorMessage, PageLoader } from '@/components/ui'
import { commentsApi, postsApi } from '@/api'
import { useAsync } from '@/hooks'
import { formatDate, estimateReadingTime } from '@/utils'

export function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const fetchPost = useCallback(() => postsApi.getBySlug(slug!), [slug])
  const { data: post, loading, error, execute } = useAsync(fetchPost)

  const [commentName, setCommentName] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!post || !commentName.trim() || !commentContent.trim()) return
    setSubmitting(true)
    try {
      await commentsApi.create({ post_id: post.id, author_name: commentName, content: commentContent })
      setSubmitted(true)
      setCommentName('')
      setCommentContent('')
    } catch {
      alert('评论提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />
  if (error || !post) return <ErrorMessage message={error ?? '文章不存在'} onRetry={execute} />

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link to="/posts" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft size={14} /> 返回博文列表
      </Link>

      {/* Meta */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {post.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
      </div>
      <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
      <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
        <span>{formatDate(post.published_at)}</span>
        <span className="flex items-center gap-1"><Clock size={13} /> {estimateReadingTime(post.content)} 分钟</span>
        <span className="flex items-center gap-1"><Eye size={13} /> {post.view_count} 次阅读</span>
      </div>

      {post.cover_url && (
        <img src={post.cover_url} alt={post.title} className="mt-6 w-full rounded-2xl object-cover max-h-72" />
      )}

      {/* Content */}
      <article className="prose prose-gray mt-8 max-w-none">
        <p className="whitespace-pre-wrap text-gray-700">{post.content}</p>
      </article>

      {/* Comment Form */}
      <div className="mt-16 border-t border-gray-100 pt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">发表评论</h2>
        {submitted ? (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            评论已提交，待审核后将显示。感谢留言！
          </div>
        ) : (
          <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="你的昵称 *"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              required
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            <textarea
              placeholder="写下你的想法... *"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              required
              rows={4}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" loading={submitting}>
                <Send size={14} /> 提交评论
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
