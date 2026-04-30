import type { Comment, CreateCommentPayload } from '@/types'
import { apiClient } from './client'

export const commentsApi = {
  listByPost: (postId: number) =>
    apiClient.get<Comment[]>(`/comments/${postId}`).then((r) => r.data),

  create: (data: CreateCommentPayload) =>
    apiClient.post<Comment>('/comments', data).then((r) => r.data),

  // 管理接口
  listPending: () =>
    apiClient.get<Comment[]>('/admin/comments').then((r) => r.data),

  approve: (id: number) =>
    apiClient.put(`/admin/comments/${id}/approve`),

  remove: (id: number) =>
    apiClient.delete(`/admin/comments/${id}`),
}
