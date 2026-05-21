import { useState, useRef, useEffect } from 'react'
import { useHrClient, useAgentChat } from '@/hooks/use-hr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface AgentTask {
  id: string
  agentId: string
  taskTitle: string
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed'
  inputParams?: string
  outputResult?: string
  durationMs?: number
  createdAt: Date
  logs?: string[]
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const agentIcons: Record<string, React.ReactNode> = {
  marta: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
  artur: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>,
  sofia: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
  danilo: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>,
  maksym: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
  olena: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>,
}

function AgentChatPanel({ agentId, agentName, onClose }: { agentId: string; agentName: string; onClose: () => void }) {
  const chatMutation = useAgentChat()
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: `Привіт! Я ${agentName}. Чим можу допомогти?`, timestamp: new Date() },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || chatMutation.isPending) return

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    try {
      const result = await chatMutation.mutateAsync({
        agentId,
        messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
      })

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.content,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не вдалося отримати відповідь'
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Помилка: ${message}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
    }
  }

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-lg">{agentIcons[agentId]}</span>
          <span className="text-sm font-semibold">{agentName} — Чат</span>
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
              msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md')}>
              {msg.role === 'assistant' && <span className="mr-1.5">{agentIcons[agentId]}</span>}
              <span className="whitespace-pre-wrap">{msg.content}</span>
              <p className="text-[10px] opacity-60 mt-1">{msg.timestamp.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <span className="mr-1.5">{agentIcons[agentId]}</span>
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

      <div className="p-3 border-t">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Напишіть повідомлення..."
            className="h-9 text-sm"
            disabled={chatMutation.isPending}
          />
          <Button size="sm" className="h-9 w-9 p-0 shrink-0" onClick={handleSend} disabled={chatMutation.isPending || !input.trim()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AgentsPage() {
  const client = useHrClient()

  const [agents, setAgents] = useState([
    { id: 'marta', name: 'Марта', role: 'ІІ-Сорсер', description: 'Автоматичний пошук резюме та вакансій на Work.ua, Robota.ua та LinkedIn.', icon: agentIcons.marta, metrics: { cpu: 12, memory: 28, activeTasks: 0 }, capabilities: ['Boolean-пошук', 'Парсинг резюме', 'Аналіз джерел'], expanded: false, chatOpen: false },
    { id: 'artur', name: 'Артур', role: 'ІІ-Аналітик', description: 'Аналіз резюме, розрахунок Match Score та генерація запитань для інтерв\'ю.', icon: agentIcons.artur, metrics: { cpu: 0, memory: 15, activeTasks: 0 }, capabilities: ['Аналіз ЗП', 'Конкуренти', 'Тренди'], expanded: false, chatOpen: false },
    { id: 'sofia', name: 'Софія', role: 'ІІ-Скринінг', description: 'Написання персоналізованих листів та ведення журналів комунікації.', icon: agentIcons.sofia, metrics: { cpu: 5, memory: 19, activeTasks: 0 }, capabilities: ['Скринінг резюме', 'Оцінка skills', 'Питання для інтерв\'ю'], expanded: false, chatOpen: false },
    { id: 'danilo', name: 'Данило', role: 'ІІ-Інтерв\'ю', description: 'Моніторинг зарплатних вилок, підготовка аналітичних звітів по ринку праці.', icon: agentIcons.danilo, metrics: { cpu: 0, memory: 11, activeTasks: 0 }, capabilities: ['Планування інтерв\'ю', 'Генерація питань', 'Координація'], expanded: false, chatOpen: false },
    { id: 'maksym', name: 'Максим', role: 'ІІ-Офери', description: 'Відстеження змін зарплат, порівняння з бюджетом компанії.', icon: agentIcons.maksym, metrics: { cpu: 0, memory: 14, activeTasks: 0 }, capabilities: ['Job offer листи', 'Компенсації', 'Benefits'], expanded: false, chatOpen: false },
    { id: 'olena', name: 'Олена', role: 'ІІ-Звіти', description: 'Моніторинг вакансій конкурентів, сигналізація про зміни.', icon: agentIcons.olena, metrics: { cpu: 0, memory: 18, activeTasks: 0 }, capabilities: ['Щотижневі звіти', 'KPI', 'AI insights'], expanded: false, chatOpen: false },
  ])

  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [stats, setStats] = useState<Array<{ agentId: string; totalTasks: number; completedTasks: number; failedTasks: number; avgDurationMs: number }>>([])
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [activeTask, setActiveTask] = useState<AgentTask | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState('marta')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskInput, setTaskInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshingStats, setRefreshingStats] = useState(false)
  const [activeTab, setActiveTab] = useState<'kanban' | 'agents'>('kanban')
  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchDbData = async () => {
      try {
        const [dbTasks, dbStats] = await Promise.all([client.getAgentTasks(), client.getAgentStats()])
        const mappedTasks = dbTasks.map((t) => ({
          id: t.id, agentId: t.agentId, taskTitle: t.taskTitle, status: t.status as any,
          inputParams: t.inputParams || '', outputResult: t.outputResult || '',
          durationMs: t.durationMs || undefined, createdAt: new Date(t.createdAt),
          logs: t.outputResult ? [`[SUCCESS] Task finished. Result: ${t.outputResult}`] : [`[INFO] Task initialized in status: ${t.status}`],
        }))
        setTasks(mappedTasks)
        setStats(dbStats)
      } catch (e) {
        console.error('Failed to load database logs/stats:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchDbData()
  }, [])

  useEffect(() => {
    if (terminalEndRef.current) terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [activeTask?.logs])

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        const activeCount = tasks.filter(t => t.agentId === agent.id && (t.status === 'running' || t.status === 'pending')).length
        let cpu = 0, memory = agent.metrics.memory
        if (activeCount > 0) {
          cpu = Math.floor(Math.random() * 40) + 40
          memory = Math.min(95, agent.metrics.memory + Math.floor(Math.random() * 5) + 2)
        } else {
          cpu = Math.floor(Math.random() * 6) + 1
          memory = Math.max(10, agent.metrics.memory + (Math.random() > 0.5 ? 1 : -1))
        }
        return { ...agent, metrics: { cpu, memory, activeTasks: activeCount } }
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [tasks])

  const toggleExpand = (agentId: string) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, expanded: !a.expanded, chatOpen: false } : a))
  }

  const toggleChat = (agentId: string) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, chatOpen: !a.chatOpen, expanded: true } : a))
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle) return
    try {
      const dbTask = await client.createAgentTask({ agentId: selectedAgentId, taskTitle, inputParams: taskInput })
      const newTask: AgentTask = {
        id: dbTask.id, agentId: selectedAgentId, taskTitle, status: 'pending',
        inputParams: taskInput, createdAt: new Date(),
        logs: [`[PLAN] Task "${taskTitle}" received. Queuing for execution...`],
      }
      setTasks(prev => [newTask, ...prev])
      setIsNewTaskOpen(false)
      setTaskTitle('')
      setTaskInput('')
      runAgentSimulation(newTask)
    } catch (e) {
      console.error('Failed to create task:', e)
    }
  }

  const appendLog = (id: string, logLine: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const logs = [...(t.logs || []), `[${new Date().toLocaleTimeString('uk-UA')}] ${logLine}`]
        const updated = { ...t, logs }
        if (activeTask && activeTask.id === id) setActiveTask(updated)
        return updated
      }
      return t
    }))
  }

  const updateStatus = async (task: AgentTask, status: AgentTask['status'], finalData?: { output?: string; duration?: number }) => {
    setTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        const updated = { ...t, status, outputResult: finalData?.output || t.outputResult, durationMs: finalData?.duration || t.durationMs }
        if (activeTask && activeTask.id === task.id) setActiveTask(updated)
        return updated
      }
      return t
    }))
    try {
      await client.updateAgentTask(task.agentId, task.id, { status, outputResult: finalData?.output, durationMs: finalData?.duration })
    } catch (err) {
      console.error('Failed to sync state to database:', err)
    }
  }

  const runAgentSimulation = async (task: AgentTask) => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    const startTime = Date.now()

    await sleep(1500)
    await updateStatus(task, 'running')
    appendLog(task.id, 'Starting agent execution thread...')

    if (task.agentId === 'marta') {
      appendLog(task.id, `Searching CV databases for "${task.inputParams || 'React Developer'}"...`)
      await sleep(2000)
      appendLog(task.id, 'Querying Work.ua and Robota.ua APIs...')
      await sleep(2000)
      const res = `Знайдено 8 нових резюме. Boolean рядок сформовано.`
      await updateStatus(task, 'completed', { output: res, duration: Date.now() - startTime })
    } else if (task.agentId === 'artur') {
      appendLog(task.id, 'Analysing hard and soft skills. Calculating semantic overlapping...')
      await sleep(2500)
      const res = `Match Score: 87%. Кандидат повністю відповідає стеку.`
      await updateStatus(task, 'completed', { output: res, duration: Date.now() - startTime })
    } else if (task.agentId === 'sofia') {
      appendLog(task.id, 'Drafting personalized email outreach...')
      await sleep(2000)
      await updateStatus(task, 'paused')
    } else if (task.agentId === 'danilo') {
      appendLog(task.id, 'Fetching real-time salary reports...')
      await sleep(2500)
      const res = `Медіана: $2800, Мін: $2100, Макс: $3600.`
      await updateStatus(task, 'completed', { output: res, duration: Date.now() - startTime })
    } else if (task.agentId === 'maksym') {
      appendLog(task.id, 'Reading current budget constraints...')
      await sleep(2000)
      await updateStatus(task, 'failed')
    } else if (task.agentId === 'olena') {
      appendLog(task.id, 'Scanning competitor job openings...')
      await sleep(2000)
      const res = `Зафіксовано активність конкурентів. Знайдено 4 нові вакансії.`
      await updateStatus(task, 'completed', { output: res, duration: Date.now() - startTime })
    }
  }

  const handleApproveTask = async (task: AgentTask) => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    setTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        const updated = { ...t, status: 'running' as const, logs: [...(t.logs || []), `[${new Date().toLocaleTimeString('uk-UA')}] User approved. Sending...`] }
        if (activeTask && activeTask.id === task.id) setActiveTask(updated)
        return updated
      }
      return t
    }))
    await sleep(2000)
    const res = `Оффер надіслано кандидату.`
    setTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        const updated = { ...t, status: 'completed' as const, outputResult: res, durationMs: 15400, logs: [...(t.logs || []), `[${new Date().toLocaleTimeString('uk-UA')}] Task completed!`] }
        if (activeTask && activeTask.id === task.id) setActiveTask(updated)
        return updated
      }
      return t
    }))
  }

  const handleRefreshStats = async () => {
    setRefreshingStats(true)
    try {
      const freshStats = await client.getAgentStats()
      setStats(freshStats)
    } catch (e) {
      console.error(e)
    } finally {
      setRefreshingStats(false)
    }
  }

  const columns = [
    { id: 'pending', title: 'Черга', color: 'border-t-blue-500' },
    { id: 'running', title: 'В роботі', color: 'border-t-purple-500' },
    { id: 'paused', title: 'На затвердженні', color: 'border-t-amber-500' },
    { id: 'completed', title: 'Виконано', color: 'border-t-emerald-500' },
    { id: 'failed', title: 'Помилка', color: 'border-t-red-500' },
  ]

  const tasksByColumn = (() => {
    const groups: Record<string, AgentTask[]> = { pending: [], running: [], paused: [], completed: [], failed: [] }
    tasks.forEach(t => { if (groups[t.status]) groups[t.status].push(t) })
    return groups
  })()

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-20" />
              {[1, 2].map(j => <Skeleton key={j} className="h-24 w-full rounded-lg" />)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2">Автономні Агенти</Typography>
          <Typography tone="muted" className="mt-1">Управління ІІ-департаментом та аналітика ефективності</Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefreshStats} variant="outline" size="sm" disabled={refreshingStats}>
            {refreshingStats ? <Spinner className="size-4 mr-1.5" /> : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
            )}
            Оновити
          </Button>
          <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                Нове завдання
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Поставити завдання ІІ-Агенту</DialogTitle>
                <DialogDescription>Оберіть виконавця та заповніть параметри запиту</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-2">
                  <Label>Виконавець</Label>
                  <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {agents.map(a => <SelectItem key={a.id} value={a.id}>{a.name} — {a.role}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Назва завдання</Label>
                  <Input placeholder="Наприклад: Знайди розробників React..." value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Додаткові інструкції</Label>
                  <Input placeholder="Стек: React, TypeScript, Node.js..." value={taskInput} onChange={e => setTaskInput(e.target.value)} />
                </div>
                <DialogFooter>
                  <Button type="submit">Запустити в роботу</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="agents">ІІ-Департамент ({agents.length})</TabsTrigger>
          <TabsTrigger value="kanban">Канбан-дошка</TabsTrigger>
        </TabsList>

        {/* Agents List with Expandable Cards */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map(agent => {
              const agentStat = stats.find(s => s.agentId === agent.id)
              const isWorking = agent.metrics.activeTasks > 0
              return (
                <Card key={agent.id} className={cn('transition-all', isWorking && 'ring-1 ring-emerald-500/20', agent.expanded && 'md:col-span-2 lg:col-span-3')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <button onClick={() => toggleExpand(agent.id)} className="flex gap-3 text-left flex-1">
                        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white', isWorking ? 'from-emerald-500 to-teal-500' : 'from-muted to-muted-foreground')}>
                          {agent.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">{agent.name}</CardTitle>
                          <CardDescription>{agent.role}</CardDescription>
                        </div>
                      </button>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={isWorking ? 'default' : 'secondary'} className={cn('text-xs', isWorking && 'bg-emerald-500')}>
                          {isWorking ? 'Busy' : 'Idle'}
                        </Badge>
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => toggleChat(agent.id)} title="Чат з агентом">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleExpand(agent.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('transition-transform', agent.expanded && 'rotate-180')}><path d="m6 9 6 6 6-6" /></svg>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Typography variant="bodySm" tone="muted">{agent.description}</Typography>

                    {/* Capabilities */}
                    <div className="flex flex-wrap gap-1.5">
                      {agent.capabilities.map(cap => (
                        <Badge key={cap} variant="outline" className="text-[10px]">{cap}</Badge>
                      ))}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>CPU</span>
                          <span className={cn('font-mono font-semibold', isWorking ? 'text-emerald-600 dark:text-emerald-400' : '')}>{agent.metrics.cpu}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={cn('h-full transition-all duration-500 rounded-full', isWorking ? 'bg-emerald-500' : 'bg-blue-500')} style={{ width: `${agent.metrics.cpu}%` }} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>RAM</span>
                          <span className="font-mono font-semibold">{agent.metrics.memory}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full transition-all duration-500 rounded-full" style={{ width: `${agent.metrics.memory}%` }} />
                        </div>
                      </div>
                    </div>

                    {agentStat && (
                      <div className="grid grid-cols-3 gap-1 pt-2 border-t text-center text-xs text-muted-foreground">
                        <div><span className="block font-bold text-foreground">{agentStat.totalTasks}</span>Виконано</div>
                        <div><span className="block font-bold text-emerald-600 dark:text-emerald-400">{agentStat.totalTasks > 0 ? `${Math.round((agentStat.completedTasks / agentStat.totalTasks) * 100)}%` : '100%'}</span>Успішність</div>
                        <div><span className="block font-bold text-foreground">{agentStat.avgDurationMs > 0 ? `${Math.round(agentStat.avgDurationMs / 1000)}с` : '0с'}</span>Сер. час</div>
                      </div>
                    )}

                    {/* Chat Panel */}
                    {agent.chatOpen && (
                      <div className="border rounded-lg overflow-hidden mt-4">
                        <AgentChatPanel agentId={agent.id} agentName={agent.name} onClose={() => toggleChat(agent.id)} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Kanban Board */}
        <TabsContent value="kanban" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {columns.map(col => {
              const colTasks = tasksByColumn[col.id] || []
              return (
                <div key={col.id} className="flex flex-col min-h-[400px]">
                  <div className={cn('flex items-center justify-between pb-3 border-b mb-3 px-1', col.color, 'border-t-2 pt-3')}>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.title}</span>
                    <Badge variant="outline" className="text-xs">{colTasks.length}</Badge>
                  </div>
                  <div className="space-y-2 flex-1">
                    {colTasks.length > 0 ? (
                      colTasks.map(task => {
                        const agent = agents.find(a => a.id === task.agentId)
                        const statusDot = task.status === 'running' ? 'bg-purple-500 animate-pulse' :
                          task.status === 'paused' ? 'bg-amber-500 animate-pulse' :
                          task.status === 'completed' ? 'bg-emerald-500' :
                          task.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                        return (
                          <Card key={task.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setActiveTask(task)}>
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-center justify-between gap-1.5">
                                <Badge variant="outline" className="text-[10px]">{agent?.name}</Badge>
                                <div className="flex items-center gap-1.5">
                                  <span className={cn('size-1.5 rounded-full', statusDot)} />
                                  <span className="text-[10px] font-mono text-muted-foreground">
                                    {task.createdAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                              <Typography variant="bodySm" className="font-medium leading-snug line-clamp-2">{task.taskTitle}</Typography>
                              {task.inputParams && (
                                <p className="text-[10px] text-muted-foreground line-clamp-2 italic border-l-2 border-border pl-2">
                                  Контекст: {task.inputParams}
                                </p>
                              )}
                              {task.status === 'paused' && (
                                <div className="flex gap-2 pt-2 border-t" onClick={e => e.stopPropagation()}>
                                  <Button size="sm" variant="default" className="flex-1 text-xs h-7" onClick={() => handleApproveTask(task)}>Затвердити</Button>
                                  <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => updateStatus(task, 'failed')}>Відхилити</Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 border border-dashed rounded-lg bg-muted/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50 mb-1.5"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" /></svg>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase">Порожньо</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Console Dialog */}
      <Dialog open={activeTask !== null} onOpenChange={open => !open && setActiveTask(null)}>
        {activeTask && (
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    <span className={cn('size-2 rounded-full', activeTask.status === 'running' ? 'bg-purple-500 animate-pulse' : activeTask.status === 'completed' ? 'bg-emerald-500' : activeTask.status === 'failed' ? 'bg-red-500' : 'bg-blue-500')} />
                    {activeTask.taskTitle}
                  </DialogTitle>
                  <DialogDescription>
                    Виконавець: {agents.find(a => a.id === activeTask.agentId)?.name}
                    <Badge variant="outline" className="ml-2">
                      {activeTask.status}
                    </Badge>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-relaxed h-64 overflow-y-auto space-y-1.5">
                {activeTask.logs?.map((log, index) => {
                  let colorClass = 'text-muted-foreground'
                  if (log.includes('[SUCCESS]') || log.includes('✅')) colorClass = 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  else if (log.includes('[PLAN]')) colorClass = 'text-primary font-semibold'
                  else if (log.includes('❌') || log.includes('Failed') || log.includes('error')) colorClass = 'text-red-600 dark:text-red-400'
                  else if (log.includes('⚠️') || log.includes('Awaiting') || log.includes('Pause')) colorClass = 'text-amber-600 dark:text-amber-400 font-semibold'
                  return (
                    <div key={index} className={cn('flex items-start gap-1', colorClass)}>
                      <span className="text-muted-foreground/50 select-none">&gt;</span>
                      <span className="flex-1">{log}</span>
                    </div>
                  )
                })}
                <div ref={terminalEndRef} />
              </div>
              {activeTask.outputResult && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase block">Результат:</span>
                  <div className="p-3 bg-muted/50 rounded-lg text-sm leading-relaxed">{activeTask.outputResult}</div>
                </div>
              )}
              {activeTask.status === 'paused' && (
                <div className="flex gap-2 pt-3 border-t">
                  <Button className="flex-1" onClick={() => handleApproveTask(activeTask)}>Затвердити</Button>
                  <Button variant="destructive" onClick={() => updateStatus(activeTask, 'failed')}>Відхилити</Button>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
