import { useEffect, useRef, useState } from 'react'
import { Bot, FileText, Send, Sparkles, Trash2, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { aiApi } from '@/api'
import { Button } from '@/components/ui'
import type { AgentRequest } from '@/types'

type RoleOption = AgentRequest['user_role']
type DemoTab = 'rag' | 'agent'

const ROLE_OPTIONS: { value: RoleOption; label: string; desc: string }[] = [
  { value: '决策者', label: '决策者', desc: '关注 ROI、风险与战略价值' },
  { value: '使用者', label: '使用者', desc: '关注易用性、效率与日常体验' },
  { value: '观望者', label: '观望者', desc: '关注技术成熟度与行业趋势' },
]

interface RagMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}

export function AIPlaygroundPage() {
  const [activeTab, setActiveTab] = useState<DemoTab>('rag')

  // Demo 1: RAG
  const [ragInput, setRagInput] = useState('')
  const [ragMessages, setRagMessages] = useState<RagMessage[]>([])
  const [ragLoading, setRagLoading] = useState(false)
  const [conversationId, setConversationId] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Demo 2: Agent
  const [selectedRole, setSelectedRole] = useState<RoleOption>('决策者')
  const [agentResult, setAgentResult] = useState('')
  const [agentLoading, setAgentLoading] = useState(false)

  useEffect(() => {
    if (ragMessages.length > 0 || ragLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [ragMessages, ragLoading])

  async function handleRagSend() {
    const q = ragInput.trim()
    if (!q || ragLoading) return
    setRagInput('')
    setRagMessages((prev) => [...prev, { role: 'user', content: q }])
    setRagLoading(true)
    try {
      const resp = await aiApi.rag({ question: q, conversation_id: conversationId })
      setConversationId(resp.conversation_id)
      setRagMessages((prev) => [...prev, { role: 'assistant', content: resp.answer, sources: resp.sources }])
    } catch {
      setRagMessages((prev) => [...prev, { role: 'assistant', content: '请求失败，请检查后端服务是否启动。' }])
    } finally {
      setRagLoading(false)
    }
  }

  function handleClearChat() {
    setConversationId('')
    setRagMessages([])
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
    <div className="mx-auto flex h-[calc(100vh-57px)] max-w-6xl flex-col px-4 py-6 sm:px-6">
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
      {/* 左侧菜单 */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-gray-50">
        <div className="border-b border-gray-200 px-5 py-5">
          <h1 className="text-base font-bold text-gray-900">AI 体验专区</h1>
          <p className="mt-0.5 text-xs text-gray-400">RAG 问答 · 智能 Agent 演示</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => setActiveTab('rag')}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
              activeTab === 'rag'
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className={`rounded-lg p-1.5 ${activeTab === 'rag' ? 'bg-primary-100' : 'bg-gray-200'}`}>
              <Bot size={14} className={activeTab === 'rag' ? 'text-primary-600' : 'text-gray-500'} />
            </div>
            <div>
              <p className="leading-tight">Demo 1</p>
              <p className={`text-xs leading-tight ${activeTab === 'rag' ? 'text-primary-500' : 'text-gray-400'}`}>智能 RAG 问答</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('agent')}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
              activeTab === 'agent'
                ? 'bg-violet-50 text-violet-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className={`rounded-lg p-1.5 ${activeTab === 'agent' ? 'bg-violet-100' : 'bg-gray-200'}`}>
              <Sparkles size={14} className={activeTab === 'agent' ? 'text-violet-600' : 'text-gray-500'} />
            </div>
            <div>
              <p className="leading-tight">Demo 2</p>
              <p className={`text-xs leading-tight ${activeTab === 'agent' ? 'text-violet-500' : 'text-gray-400'}`}>虚拟 Agent 话术</p>
            </div>
          </button>
        </nav>

        <div className="border-t border-gray-200 px-4 py-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            基于 Dify + DeepSeek<br />RAG 向量检索增强生成
          </p>
        </div>
      </aside>

      {/* 右侧主内容 */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {activeTab === 'rag' ? (
          <>
            {/* RAG Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary-600 p-2">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Demo 1：智能 RAG 问答</h2>
                  <p className="text-xs text-gray-400">基于个人知识库，向量检索增强生成 · 支持多轮对话</p>
                </div>
              </div>
              {ragMessages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition"
                >
                  <Trash2 size={12} />
                  清空对话
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-white px-6 py-6 space-y-5">
              {ragMessages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="rounded-2xl bg-primary-50 p-4">
                    <Bot size={32} className="text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">同 AI 知识库助手</p>
                    <p className="mt-1 text-sm text-gray-400">试试问我：</p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {['你有哪些专利？', '你做过哪些 AI 项目？', '你熟悉哪些技术栈？'].map((q) => (
                        <button
                          key={q}
                          onClick={() => { setRagInput(q); }}
                          className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs text-primary-600 hover:bg-primary-100 transition"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {ragMessages.map((msg, i) => (
                <div key={i} className={msg.role === 'user' ? 'flex justify-end gap-2' : 'flex gap-2'}>
                  {msg.role === 'assistant' && (
                    <div className="mt-0.5 shrink-0 rounded-full bg-primary-100 p-1.5 self-start">
                      <Bot size={14} className="text-primary-600" />
                    </div>
                  )}
                  <div className={msg.role === 'user' ? 'max-w-[60%]' : 'max-w-[75%]'}>
                    <div
                      className={
                        msg.role === 'user'
                          ? 'rounded-2xl rounded-br-sm bg-primary-600 px-4 py-2.5 text-sm text-white'
                          : 'rounded-2xl rounded-bl-sm bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-700'
                      }
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm prose-gray max-w-none
                          prose-p:my-1 prose-p:leading-relaxed
                          prose-ul:my-1 prose-ul:pl-4
                          prose-ol:my-1 prose-ol:pl-4
                          prose-li:my-0.5
                          prose-strong:text-gray-800 prose-strong:font-semibold
                          prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-xs prose-code:text-primary-700
                          prose-pre:bg-gray-100 prose-pre:text-xs prose-pre:rounded-lg
                          prose-headings:text-gray-800 prose-headings:font-semibold prose-h3:text-sm prose-h4:text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {msg.sources.map((src) => (
                          <span
                            key={src}
                            className="inline-flex items-center gap-1 rounded-full border border-primary-100 bg-primary-50 px-2 py-0.5 text-xs text-primary-600"
                          >
                            <FileText size={10} />
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="mt-0.5 shrink-0 rounded-full bg-gray-100 p-1.5 self-start">
                      <User size={14} className="text-gray-500" />
                    </div>
                  )}
                </div>
              ))}

              {ragLoading && (
                <div className="flex gap-2">
                  <div className="mt-0.5 shrink-0 rounded-full bg-primary-100 p-1.5 self-start">
                    <Bot size={14} className="text-primary-600" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm bg-gray-50 border border-gray-100 px-4 py-3">
                    <span className="inline-flex gap-1.5 items-center">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="h-2 w-2 rounded-full bg-primary-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={ragInput}
                  onChange={(e) => setRagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRagSend()}
                  placeholder="输入问题，按 Enter 发送..."
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition"
                />
                <Button onClick={handleRagSend} loading={ragLoading} className="px-5">
                  <Send size={15} />
                  发送
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Agent Header */}
            <div className="flex items-center border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-600 p-2">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Demo 2：虚拟 Agent 话术生成</h2>
                  <p className="text-xs text-gray-400">多智能体决策Demo演示 · 按角色生成定制话术</p>
                </div>
              </div>
            </div>

            {/* Agent Content */}
            <div className="flex-1 overflow-y-auto bg-white px-6 py-8">
              <div className="mx-auto max-w-lg">
                <p className="mb-6 text-sm text-gray-500">选择用户角色，AI Agent 将针对性地生成 AI 推荐话术：</p>

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
                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleAgentDemo}
                  loading={agentLoading}
                  className="mt-6 w-full bg-violet-600 hover:bg-violet-700"
                >
                  <Sparkles size={15} />
                  生成推荐话术
                </Button>

                {agentResult && (
                  <div className="mt-6 rounded-xl border border-violet-100 bg-violet-50 p-5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {agentResult}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      </div>
    </div>
  )
}
