import type { LoginRequest, LoginResponse } from '@/types'
import { apiClient } from './client'

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  logout: () =>
    apiClient.post('/auth/logout'),
}
