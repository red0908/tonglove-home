import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Eye } from 'lucide-react'
import { Badge, Card, ErrorMessage, PageLoader } from '@/components/ui'
import { postsApi } from '@/api'
import { useAsync } from '@/hooks'
import { formatDate, estimateReadingTime } from '@/utils'

export function PostListPage() {
  const fetchPosts = useCallback(() => postsApi.list(), [])
  const { data, loading, error, execute } = useAsync(fetchPosts)

  if (loading) return <PageLoader />
  if (error) return <ErrorMessage message={error} onRetry={execute} />

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">技术博文</h1>
        <p className="mt-2 text-gray-500">AI 技术思考与工程实践分享</p>
      </div>

      {data && data.items.length > 0 ? (
        <div className="flex flex-col gap-5">
          {data.items.map((post) => (
            <Link key={post.id} to={`/posts/${post.slug}`}>
              <Card hover className="flex gap-5 p-5">
                {post.cover_url && (
                  <img
                    src={post.cover_url}
                    alt={post.title}
                    className="h-24 w-36 shrink-0 rounded-xl object-cover"
                  />
                )}
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="default">{tag}</Badge>
                    ))}
                  </div>
                  <h2 className="font-semibold text-gray-900 line-clamp-1">{post.title}</h2>
                  <p className="text-sm text-gray-500 line-clamp-2">{post.summary}</p>
                  <div className="mt-auto flex items-center gap-4 text-xs text-gray-400">
                    <span>{formatDate(post.published_at)}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {estimateReadingTime(post.content)} 分钟阅读
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {post.view_count}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-gray-400">暂无已发布博文</div>
      )}
    </div>
  )
}
