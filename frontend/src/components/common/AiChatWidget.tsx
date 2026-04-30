import { useState } from 'react'
import { Bot, Send, X } from 'lucide-react'
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

  if (!isAiChatOpen) return null

  async function handleSend() {
    const question = input.trim()
    if (!question || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setLoading(true)

    try {
      const resp = await aiApi.rag({ question })
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
          <div key={i} className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={
                msg.role === 'user'
                  ? 'max-w-[80%] rounded-2xl rounded-br-sm bg-primary-600 px-3 py-2 text-sm text-white'
                  : 'max-w-[85%] rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-2 text-sm text-gray-700'
              }
            >
              <p>{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  来源：{msg.sources.join('、')}
                </p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-2">
              <span className="inline-flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
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
