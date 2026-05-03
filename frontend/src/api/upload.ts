import { apiClient } from './client'

export const uploadApi = {
  image: async (file: File): Promise<string> => {
    const form = new FormData()
    form.append('file', file)
    const res = await apiClient.post<{ url: string }>('/admin/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.url
  },
}
