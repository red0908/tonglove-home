import type { KnowledgeDoc, PersonalInfo } from '@/types'
import { apiClient } from './client'

export const infoApi = {
  get: () =>
    apiClient.get<PersonalInfo>('/info').then((r) => r.data),
}

export const knowledgeApi = {
  list: () =>
    apiClient.get<KnowledgeDoc[]>('/admin/knowledge').then((r) => r.data),

  create: (data: Partial<KnowledgeDoc>) =>
    apiClient.post<KnowledgeDoc>('/admin/knowledge', data).then((r) => r.data),

  update: (id: number, data: Partial<KnowledgeDoc>) =>
    apiClient.put<KnowledgeDoc>(`/admin/knowledge/${id}`, data).then((r) => r.data),

  remove: (id: number) =>
    apiClient.delete(`/admin/knowledge/${id}`),
}
