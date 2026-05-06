import { useEffect, useRef, useState } from 'react'
import { Bot, FileText, Send, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { aiApi } from '@/api'
import { useUiStore } from '@/store'
import { Button } from '@/components/ui'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}

export function AiChatWidget() {
  const { isAiChatOpen, closeAiChat } = useUiStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是 TongAI 的智能助手，可以回答关于我的技术背景、项目经验和专利的问题。请随意提问！',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  if (!isAiChatOpen) return null

  async function handleSend() {
    const question = input.trim()
    if (!question || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setLoading(true)

    try {
      const resp = await aiApi.rag({ question, conversation_id: conversationId })
      setConversationId(resp.conversation_id)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: resp.answer, sources: resp.sources },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，暂时无法回答，请稍后再试。' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-80 flex-col rounded-2xl border border-gray-200 bg-white shadow-xl sm:w-96">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl bg-primary-600 px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <Bot size={18} />
          <span className="font-medium text-sm">AI 助手</span>
        </div>
        <button onClick={closeAiChat} className="text-white/80 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3 overflow-y-auto p-4 h-72">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'flex justify-end gap-1.5' : 'flex justify-start gap-1.5'}>
            {msg.role === 'assistant' && (
              <div className="mt-0.5 shrink-0 rounded-full bg-primary-100 p-1 self-start">
                <Bot size={12} className="text-primary-600" />
              </div>
            )}
            <div className={msg.role === 'user' ? 'max-w-[80%]' : 'max-w-[85%]'}>
              <div
                className={
                  msg.role === 'user'
                    ? 'rounded-2xl rounded-br-sm bg-primary-600 px-3 py-2 text-sm text-white'
                    : 'rounded-2xl rounded-bl-sm bg-gray-50 border border-gray-100 px-3 py-2 text-sm text-gray-700'
                }
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm prose-gray max-w-none
                    prose-p:my-0.5 prose-p:leading-relaxed
                    prose-ul:my-0.5 prose-ul:pl-4
                    prose-ol:my-0.5 prose-ol:pl-4
                    prose-li:my-0
                    prose-strong:text-gray-800 prose-strong:font-semibold
                    prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-xs prose-code:text-primary-700
                    prose-headings:text-gray-800 prose-headings:font-semibold prose-headings:text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="leading-relaxed">{msg.content}</p>
                )}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {msg.sources.map((src) => (
                    <span
                      key={src}
                      className="inline-flex items-center gap-1 rounded-full border border-primary-100 bg-primary-50 px-2 py-0.5 text-xs text-primary-600"
                    >
                      <FileText size={9} />
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start gap-1.5">
            <div className="mt-0.5 shrink-0 rounded-full bg-primary-100 p-1 self-start">
              <Bot size={12} className="text-primary-600" />
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-gray-50 border border-gray-100 px-3 py-2">
              <span className="inline-flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-primary-300 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-gray-100 p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="输入问题..."
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
        <Button size="sm" onClick={handleSend} loading={loading} className="shrink-0">
          <Send size={14} />
        </Button>
      </div>
    </div>
  )
}

export function AiFloatButton() {
  const { isAiChatOpen, openAiChat } = useUiStore()

  if (isAiChatOpen) return null

  return (
    <button
      onClick={openAiChat}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-primary-700 hover:shadow-xl"
    >
      <Bot size={18} />
      试试AI助手
    </button>
  )
}
