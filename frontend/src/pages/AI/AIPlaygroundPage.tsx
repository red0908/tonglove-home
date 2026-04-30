import { useState } from 'react'
import { Bot, Send, Sparkles, User } from 'lucide-react'
import { aiApi } from '@/api'
import { Button } from '@/components/ui'
import type { AgentRequest } from '@/types'

type RoleOption = AgentRequest['user_role']

const ROLE_OPTIONS: { value: RoleOption; label: string; desc: string }[] = [
  { value: 'decision_maker', label: '决策者', desc: '关注 ROI、风险与战略价值' },
  { value: 'user', label: '使用者', desc: '关注易用性、效率与日常体验' },
  { value: 'observer', label: '观望者', desc: '关注技术成熟度与行业趋势' },
]

interface RagMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}

export function AIPlaygroundPage() {
  // Demo 1: RAG
  const [ragInput, setRagInput] = useState('')
  const [ragMessages, setRagMessages] = useState<RagMessage[]>([])
  const [ragLoading, setRagLoading] = useState(false)

  // Demo 2: Agent
  const [selectedRole, setSelectedRole] = useState<RoleOption>('decision_maker')
  const [agentResult, setAgentResult] = useState('')
  const [agentLoading, setAgentLoading] = useState(false)

  async function handleRagSend() {
    const q = ragInput.trim()
    if (!q || ragLoading) return
    setRagInput('')
    setRagMessages((prev) => [...prev, { role: 'user', content: q }])
    setRagLoading(true)
    try {
      const resp = await aiApi.rag({ question: q })
      setRagMessages((prev) => [...prev, { role: 'assistant', content: resp.answer, sources: resp.sources }])
    } catch {
      setRagMessages((prev) => [...prev, { role: 'assistant', content: '请求失败，请检查后端服务是否启动。' }])
    } finally {
      setRagLoading(false)
    }
  }

  async function handleAgentDemo() {
    setAgentLoading(true)
    setAgentResult('')
    try {
      const resp = await aiApi.agentDemo({ user_role: selectedRole })
      setAgentResult(resp.suggestion)
    } catch {
      setAgentResult('请求失败，请检查后端服务是否启动。')
    } finally {
      setAgentLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">AI 体验专区</h1>
        <p className="mt-2 text-gray-500">探索 RAG 问答与多智能体决策 Demo，感受 AI 工程落地能力</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Demo 1: RAG */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-violet-50 px-5 py-4">
            <div className="rounded-xl bg-primary-600 p-2">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Demo 1：智能 RAG 问答</h2>
              <p className="text-xs text-gray-500">基于个人知识库，检索增强生成</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-64">
            {ragMessages.length === 0 && (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                试着问我"你有哪些专利？"或"你用过哪些 AI 框架？"
              </div>
            )}
            {ragMessages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'flex justify-end' : 'flex gap-2'}>
                {msg.role === 'assistant' && (
                  <Bot size={16} className="mt-1 shrink-0 text-primary-500" />
                )}
                <div
                  className={
                    msg.role === 'user'
                      ? 'max-w-[80%] rounded-2xl rounded-br-sm bg-primary-600 px-3 py-2 text-sm text-white'
                      : 'max-w-[85%] rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-2 text-sm text-gray-700'
                  }
                >
                  <p>{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <p className="mt-1 text-xs text-gray-400">来源：{msg.sources.join('、')}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <User size={16} className="mt-1 shrink-0 text-primary-300" />
                )}
              </div>
            ))}
            {ragLoading && (
              <div className="flex gap-2">
                <Bot size={16} className="mt-1 shrink-0 text-primary-500" />
                <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-2">
                  <span className="inline-flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-gray-100 p-3">
            <input
              type="text"
              value={ragInput}
              onChange={(e) => setRagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRagSend()}
              placeholder="输入问题..."
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            <Button size="sm" onClick={handleRagSend} loading={ragLoading}>
              <Send size={14} />
            </Button>
          </div>
        </div>

        {/* Demo 2: Agent */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50 px-5 py-4">
            <div className="rounded-xl bg-violet-600 p-2">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Demo 2：虚拟 Agent 话术生成</h2>
              <p className="text-xs text-gray-500">多智能体决策专利演示（专利 2）</p>
            </div>
          </div>

          <div className="flex-1 p-6">
            <p className="mb-4 text-sm text-gray-600">选择用户角色，AI Agent 将针对性地生成推荐话术：</p>

            <div className="grid gap-3">
              {ROLE_OPTIONS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setSelectedRole(value)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                    selectedRole === value
                      ? 'border-violet-400 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedRole === value ? 'border-violet-500' : 'border-gray-300'}`}>
                    {selectedRole === value && <div className="h-2 w-2 rounded-full bg-violet-500" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={handleAgentDemo}
              loading={agentLoading}
              className="mt-6 w-full bg-violet-600 hover:bg-violet-700"
            >
              <Sparkles size={15} /> 生成推荐话术
            </Button>

            {agentResult && (
              <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm text-gray-700 whitespace-pre-wrap">
                {agentResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
