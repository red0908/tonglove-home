import type { PaginatedResponse, Post } from '@/types'
import { apiClient } from './client'

export const postsApi = {
  list: (params?: { page?: number; page_size?: number; tag?: string }) =>
    apiClient.get<PaginatedResponse<Post>>('/posts', { params }).then((r) => r.data),

  getBySlug: (slug: string) =>
    apiClient.get<Post>(`/posts/${slug}`).then((r) => r.data),

  // 管理接口
  listAll: (params?: { page?: number; page_size?: number }) =>
    apiClient.get<PaginatedResponse<Post>>('/admin/posts', { params }).then((r) => r.data),

  create: (data: Partial<Post>) =>
    apiClient.post<Post>('/admin/posts', data).then((r) => r.data),

  update: (id: number, data: Partial<Post>) =>
    apiClient.put<Post>(`/admin/posts/${id}`, data).then((r) => r.data),

  remove: (id: number) =>
    apiClient.delete(`/admin/posts/${id}`),
}
