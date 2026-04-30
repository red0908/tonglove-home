import { useCallback } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { commentsApi } from '@/api'
import { Button, ErrorMessage, PageLoader } from '@/components/ui'
import { useAsync } from '@/hooks'
import { formatDate } from '@/utils'

export function AdminComments() {
  const fetchComments = useCallback(() => commentsApi.listPending(), [])
  const { data, loading, error, execute } = useAsync(fetchComments)

  if (loading) return <PageLoader />
  if (error) return <ErrorMessage message={error} onRetry={execute} />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">评论审核</h1>
        <p className="mt-1 text-sm text-gray-500">审核用户提交的评论</p>
      </div>

      <div className="flex flex-col gap-4">
        {data?.map((comment) => (
          <div key={comment.id} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-medium text-gray-900 text-sm">{comment.author_name}</span>
                  <span className="text-xs text-gray-400">· 博文 #{comment.post_id}</span>
                  <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600">{comment.content}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    await commentsApi.approve(comment.id)
                    execute()
                  }}
                >
                  <Check size={14} /> 通过
                </Button>
                <button
                  onClick={async () => {
                    await commentsApi.remove(comment.id)
                    execute()
                  }}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!data?.length && (
          <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
            暂无待审核评论
          </div>
        )}
      </div>
    </div>
  )
}
