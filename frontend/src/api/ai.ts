import type { AgentRequest, AgentResponse, RagRequest, RagResponse } from '@/types'
import { apiClient } from './client'

export const aiApi = {
  rag: (data: RagRequest) =>
    apiClient.post<RagResponse>('/ai/rag', data).then((r) => r.data),

  agentDemo: (data: AgentRequest) =>
    apiClient.post<AgentResponse>('/ai/agent/demo', data).then((r) => r.data),
}
