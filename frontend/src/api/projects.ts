import type { PaginatedResponse, Project } from '@/types'
import { apiClient } from './client'

export const projectsApi = {
  list: (params?: { page?: number; page_size?: number; tag?: string }) =>
    apiClient.get<PaginatedResponse<Project>>('/projects', { params }).then((r) => r.data),

  getBySlug: (slug: string) =>
    apiClient.get<Project>(`/projects/${slug}`).then((r) => r.data),

  // 管理接口
  listAll: (params?: { page?: number; page_size?: number }) =>
    apiClient.get<PaginatedResponse<Project>>('/admin/projects', { params }).then((r) => r.data),

  create: (data: Partial<Project>) =>
    apiClient.post<Project>('/admin/projects', data).then((r) => r.data),

  update: (id: number, data: Partial<Project>) =>
    apiClient.put<Project>(`/admin/projects/${id}`, data).then((r) => r.data),

  remove: (id: number) =>
    apiClient.delete(`/admin/projects/${id}`),
}
