import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  card?: { title: string; items: string[] }
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Привіт! Я ваш AI HR асистент. Чим можу допомогти сьогодні?' },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const quickActions = [
    { icon: '🔍', label: 'Знайти кандидатів', prompt: 'Як знайти кандидатів на React Developer?' },
    { icon: '💰', label: 'Проаналізувати ринок ЗП', prompt: 'Проаналізуй ринок зарплат для Senior React Developer' },
    { icon: '📊', label: 'Створити звіт', prompt: 'Створи щотижневий звіт з рекрутингу' },
    { icon: '❓', label: 'Допомога', prompt: 'Як користуватися платформою?' },
  ]

  const simulateResponse = () => {
    setIsTyping(true)
    setTimeout(() => {
      const response: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Ось що я знайшов:',
        card: {
          title: '📊 Ринок Python Dev — Київ, Senior',
          items: [
            'Avg ЗП: $4,200',
            'Топ skills: Django, FastAPI, AWS',
            'Активних кандидатів на job boards: 34',
          ],
        },
      }
      setMessages(prev => [...prev, response])
      setIsTyping(false)
    }, 1500)
  }

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    simulateResponse()
  }

  const handleQuickAction = (prompt: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: prompt }
    setMessages(prev => [...prev, userMsg])
    simulateResponse()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-background rounded-2xl shadow-2xl border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
          </div>
          <span className="text-sm font-semibold">AI HR Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setOpen(false)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
              msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md')}>
              {msg.role === 'assistant' && <span className="mr-1.5">🤖</span>}
              {msg.content}
              {msg.card && (
                <div className="mt-2 p-3 bg-background rounded-lg border space-y-1.5">
                  <p className="text-xs font-semibold">{msg.card.title}</p>
                  {msg.card.items.map((item, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {item}</p>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="h-6 text-[10px]">🔍 Шукати</Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10px]">💾 Зберегти</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <span className="mr-1.5">🤖</span>
              <div className="flex gap-1">
                <span className="size-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="size-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="size-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map(action => (
              <button key={action.label} onClick={() => handleQuickAction(action.prompt)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs hover:bg-muted transition-colors">
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Напишіть повідомлення..."
            className="h-9 text-sm"
          />
          <Button size="sm" className="h-9 w-9 p-0 shrink-0" onClick={handleSend}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
