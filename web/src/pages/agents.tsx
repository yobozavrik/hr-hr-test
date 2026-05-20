import { useState, useEffect, useMemo, useRef } from 'react'
import { useHrClient } from '@/hooks/use-hr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

interface AgentStats {
  agentId: string
  totalTasks: number
  completedTasks: number
  failedTasks: number
  avgDurationMs: number
}

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

interface AIAgent {
  id: string
  name: string
  role: string
  description: string
  gradient: string
  icon: string
  metrics: {
    cpu: number
    memory: number
    activeTasks: number
  }
}

const getAgentDefaultTask = (agentId: string, vacancy: string) => {
  const v = vacancy.trim() || 'React Developer'
  switch (agentId) {
    case 'marta': return `Boolean пошук та сорсинг кандидатів для "${v}"`
    case 'artur': return `Скринінг резюме під вимоги вакансії "${v}"`
    case 'sofia': return `Підготовка шаблонів аутрич-імейлів під вакансію "${v}"`
    case 'danilo': return `Аналіз вилок зарплат та кон'юнктури ринку для "${v}"`
    case 'maksym': return `Перевірка лімітів бюджету для вакансії "${v}"`
    case 'olena': return `Аналіз аналогічних пропозицій конкурентів для "${v}"`
    default: return ''
  }
}

export function AgentsPage() {
  const client = useHrClient()

  // Agents Definition
  const [agents, setAgents] = useState<AIAgent[]>([
    {
      id: 'marta',
      name: 'Марта',
      role: 'ІІ-Сорсер (Sourcing Specialist)',
      description: 'Автоматичний пошук резюме та вакансій на Work.ua, Robota.ua та LinkedIn за ключовими запитами.',
      gradient: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
      icon: 'search',
      metrics: { cpu: 12, memory: 28, activeTasks: 0 },
    },
    {
      id: 'artur',
      name: 'Артур',
      role: 'ІІ-Асесор (Assessment Expert)',
      description: 'Аналіз резюме, розрахунок відсотка відповідності вимогам (Match Score) та генерація запитань для інтерв’ю.',
      gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
      icon: 'fact_check',
      metrics: { cpu: 0, memory: 15, activeTasks: 0 },
    },
    {
      id: 'sofia',
      name: 'Софія',
      role: 'ІІ-Координатор (Outreach Specialist)',
      description: 'Написання персоналізованих супровідних листів та пропозицій, ведення журналів комунікації.',
      gradient: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
      icon: 'mail',
      metrics: { cpu: 5, memory: 19, activeTasks: 0 },
    },
    {
      id: 'danilo',
      name: 'Данило',
      role: 'ІІ-Аналітик (HR Analyst)',
      description: 'Моніторинг зарплатних вилок, підготовка аналітичних звітів по ринку праці та розрахунок статистики.',
      gradient: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
      icon: 'analytics',
      metrics: { cpu: 0, memory: 11, activeTasks: 0 },
    },
    {
      id: 'maksym',
      name: 'Максим',
      role: 'ІІ-Монітор Зарплат (Salary Monitor)',
      description: 'Відстеження змін зарплатних вилок по вакансіях, порівняння з бюджетом компанії та сповіщення про відхилення.',
      gradient: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
      icon: 'monetization_on',
      metrics: { cpu: 0, memory: 14, activeTasks: 0 },
    },
    {
      id: 'olena',
      name: 'Олена',
      role: 'ІІ-Розвідник Конкурентів (Competitor Specialist)',
      description: 'Моніторинг вакансій компаній-конкурентів, сигналізація про відкриття та закриття вакансій.',
      gradient: 'from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-400',
      icon: 'visibility',
      metrics: { cpu: 0, memory: 18, activeTasks: 0 },
    },
  ])

  // State Management
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [stats, setStats] = useState<AgentStats[]>([])
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [isBatchOpen, setIsBatchOpen] = useState(false)
  const [batchVacancy, setBatchVacancy] = useState('Angular Developer')
  const [batchTemplate, setBatchTemplate] = useState<'sourcing' | 'outreach' | 'intelligence'>('sourcing')
  const [batchCustomTitles, setBatchCustomTitles] = useState<Record<string, string>>({})
  const [batchEnabledAgents, setBatchEnabledAgents] = useState<Record<string, boolean>>({
    danilo: true,
    marta: true,
    olena: true,
    artur: true,
    sofia: false,
    maksym: false,
  })

  useEffect(() => {
    const templateAgents: Record<string, string[]> = {
      sourcing: ['danilo', 'marta', 'olena', 'artur'],
      outreach: ['artur', 'sofia'],
      intelligence: ['danilo', 'maksym']
    }

    const activeAgents = templateAgents[batchTemplate] || []
    const enabled: Record<string, boolean> = {}
    const titles: Record<string, string> = {}
    const vName = batchVacancy.trim() || 'React Developer'
    
    const allAgentIds = ['marta', 'artur', 'sofia', 'danilo', 'maksym', 'olena']
    allAgentIds.forEach(id => {
      enabled[id] = activeAgents.includes(id)
      titles[id] = getAgentDefaultTask(id, vName)
    })
    
    setBatchEnabledAgents(enabled)
    setBatchCustomTitles(titles)
  }, [batchVacancy, batchTemplate])

  const [activeTask, setActiveTask] = useState<AgentTask | null>(null)
  
  // Form fields
  const [selectedAgentId, setSelectedAgentId] = useState('marta')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskInput, setTaskInput] = useState('')

  // Loading states
  const [loading, setLoading] = useState(true)
  const [refreshingStats, setRefreshingStats] = useState(false)

  // Terminal scroll reference
  const terminalEndRef = useRef<HTMLDivElement>(null)

  // Fetch initial logs and stats from db
  const fetchDbData = async () => {
    try {
      const [dbTasks, dbStats] = await Promise.all([
        client.getAgentTasks(),
        client.getAgentStats()
      ])

      const mappedTasks = dbTasks.map((t: any) => ({
        id: t.id,
        agentId: t.agentId,
        taskTitle: t.taskTitle,
        status: t.status as any,
        inputParams: t.inputParams || '',
        outputResult: t.outputResult || '',
        durationMs: t.durationMs || undefined,
        createdAt: new Date(t.createdAt),
        logs: t.outputResult ? [`[SUCCESS] Task finished. Result: ${t.outputResult}`] : [`[INFO] Task initialized in status: ${t.status}`]
      }))

      setTasks(mappedTasks)
      setStats(dbStats)
    } catch (e) {
      console.error('Failed to load database logs/stats:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDbData()
  }, [])

  // Auto-scroll logs terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeTask?.logs])

  // Fluctuating agent metrics (CPU/Memory simulation for visual immersion)
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        // Count active tasks for this agent
        const activeCount = tasks.filter(t => t.agentId === agent.id && (t.status === 'running' || t.status === 'pending')).length
        
        let cpu = 0
        let memory = agent.metrics.memory

        if (activeCount > 0) {
          cpu = Math.floor(Math.random() * 40) + 40 // 40-80% CPU
          memory = Math.min(95, agent.metrics.memory + Math.floor(Math.random() * 5) + 2)
        } else {
          cpu = Math.floor(Math.random() * 6) + 1 // 1-7% Idle CPU
          memory = Math.max(10, agent.metrics.memory + (Math.random() > 0.5 ? 1 : -1))
        }

        return {
          ...agent,
          metrics: {
            cpu,
            memory,
            activeTasks: activeCount
          }
        }
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [tasks])

  // Handle task submission
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle) return

    try {
      // 1. Save pending task entry in database
      const dbTask = await client.createAgentTask({
        agentId: selectedAgentId,
        taskTitle,
        inputParams: taskInput
      })

      const newTask: AgentTask = {
        id: dbTask.id,
        agentId: selectedAgentId,
        taskTitle,
        status: 'pending',
        inputParams: taskInput,
        createdAt: new Date(),
        logs: [`[PLAN] Task "${taskTitle}" received. Queuing for execution...`]
      }

      setTasks(prev => [newTask, ...prev])
      setIsNewTaskOpen(false)
      setTaskTitle('')
      setTaskInput('')

      // 2. Start simulation loop
      runAgentSimulation(newTask)
    } catch (e) {
      console.error('Failed to create task:', e)
    }
  }

  // Handle batch task submission
  const handleCreateBatchTasks = async (e: React.FormEvent) => {
    e.preventDefault()
    const activeAgents = Object.keys(batchEnabledAgents).filter(id => batchEnabledAgents[id])
    if (activeAgents.length === 0) return

    try {
      const apiCalls = activeAgents.map(async (agentId) => {
        const title = batchCustomTitles[agentId] || getAgentDefaultTask(agentId, batchVacancy)
        const dbTask = await client.createAgentTask({
          agentId,
          taskTitle: title,
          inputParams: batchVacancy
        })

        return {
          id: dbTask.id,
          agentId,
          taskTitle: title,
          status: 'pending' as const,
          inputParams: batchVacancy,
          createdAt: new Date(),
          logs: [`[PLAN] Batch Task "${title}" received. Queuing for execution...`]
        }
      })

      const newTasks = await Promise.all(apiCalls)
      setTasks(prev => [...newTasks, ...prev])
      setIsBatchOpen(false)

      newTasks.forEach(task => {
        runAgentSimulation(task)
      })
    } catch (e) {
      console.error('Failed to create batch tasks:', e)
    }
  }

  // Helper to push log line
  const appendLog = (id: string, logLine: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const logs = [...(t.logs || []), `[${new Date().toLocaleTimeString('uk-UA')}] ${logLine}`]
        const updated = { ...t, logs }
        if (activeTask && activeTask.id === id) {
          setActiveTask(updated)
        }
        return updated
      }
      return t
    }))
  }

  // Helper to update status
  const updateStatus = async (task: AgentTask, status: AgentTask['status'], finalData?: { output?: string; duration?: number }) => {
    setTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        const updated = {
          ...t,
          status,
          outputResult: finalData?.output || t.outputResult,
          durationMs: finalData?.duration || t.durationMs
        }
        if (activeTask && activeTask.id === task.id) {
          setActiveTask(updated)
        }
        return updated
      }
      return t
    }))

    // Sync status with database
    try {
      await client.updateAgentTask(task.agentId, task.id, {
        status,
        outputResult: finalData?.output,
        durationMs: finalData?.duration
      })
    } catch (err) {
      console.error('Failed to sync state to database:', err)
    }
  }

  // Simulation execution engine
  const runAgentSimulation = async (task: AgentTask) => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    const startTime = Date.now()

    // Retrieve vacancy context from input params or taskTitle
    const vName = task.inputParams?.trim() || 'React Developer'

    // Transition to RUNNING
    await sleep(1500)
    await updateStatus(task, 'running')
    appendLog(task.id, '🚀 Starting agent execution thread...')

    // Custom steps based on Agent Role
    if (task.agentId === 'marta') {
      appendLog(task.id, `🔍 Searching CV databases for "${vName}"...`)
      await sleep(2000)
      appendLog(task.id, '🔍 Querying Work.ua and Robota.ua APIs...')
      await sleep(2000)
      appendLog(task.id, `✨ Found candidate matches. Filtering profiles by keywords related to "${vName}"...`)
      await sleep(1500)
      
      const res = `Знайдено 8 нових резюме за запитом "${vName}". Boolean рядок: "${vName.replace(/"/g, '')}" AND ("developer" OR "engineer")`
      const duration = Date.now() - startTime
      await updateStatus(task, 'completed', { output: res, duration })
      appendLog(task.id, '✅ Task completed successfully. Results saved to database.')
      
    } else if (task.agentId === 'artur') {
      appendLog(task.id, `📑 Loading candidate CV document and vacancy criteria for "${vName}"...`)
      await sleep(2000)
      appendLog(task.id, '🧠 Analysing hard and soft skills. Calculating semantic overlapping...')
      await sleep(2500)
      appendLog(task.id, '⚖️ Weighing salary expectations vs company budget...')
      await sleep(1500)
      
      const res = `Match Score: 87%. Кандидат повністю відповідає стеку "${vName}". Рекомендовано до інтерв'ю.`
      const duration = Date.now() - startTime
      await updateStatus(task, 'completed', { output: res, duration })
      appendLog(task.id, '✅ Assessment completed. Scoring saved.')

    } else if (task.agentId === 'sofia') {
      appendLog(task.id, `📝 Drafting personalized email outreach based on candidate CV and vacancy "${vName}"...`)
      await sleep(2000)
      appendLog(task.id, '⚠️ Pause: Generating proposal requires user approval before sending.')
      
      // Move to paused (Needs Review)
      await updateStatus(task, 'paused')
      appendLog(task.id, '💬 Awaiting HR Manager approval for the generated draft email...')

    } else if (task.agentId === 'danilo') {
      appendLog(task.id, `📊 Fetching real-time salary reports for "${vName}"...`)
      await sleep(2000)
      appendLog(task.id, '📈 Executing market statistics calculations (median, p25, p75)...')
      await sleep(2500)
      
      const res = `Аналітика по позиції "${vName}": Медіана: $2800, Мін: $2100, Макс: $3600. Попит: Дуже високий.`
      const duration = Date.now() - startTime
      await updateStatus(task, 'completed', { output: res, duration })
      appendLog(task.id, '✅ Market salary analytics reports created.')

    } else if (task.agentId === 'maksym') {
      appendLog(task.id, `💰 Reading current budget constraints for "${vName}"...`)
      await sleep(1500)
      appendLog(task.id, '📉 Comparing against recent competitor listings...')
      await sleep(2000)
      
      // Simulate validation failure (Failed state example)
      appendLog(task.id, '❌ Connection error: competitor aggregator API endpoint timed out.')
      await updateStatus(task, 'failed')
      appendLog(task.id, '❌ Task execution aborted due to critical API timeout.')

    } else if (task.agentId === 'olena') {
      appendLog(task.id, `🕵️ Scanning competitor job openings for "${vName}" on regional boards...`)
      await sleep(2000)
      appendLog(task.id, '📦 Detecting patterns: Competitor companies opened 4 new vacancies.')
      await sleep(2000)
      
      const res = `Зафіксовано активність конкурентів за запитом "${vName}". Знайдено 4 нові вакансії. Рівень загрози: Середній.`
      const duration = Date.now() - startTime
      await updateStatus(task, 'completed', { output: res, duration })
      appendLog(task.id, '✅ Competitor intelligence analysis logged.')
    }

    // Refresh aggregated DB view stats
    try {
      const freshStats = await client.getAgentStats()
      setStats(freshStats)
    } catch (e) {
      console.warn('Failed to refresh stats view:', e)
    }
  }

  // Handle manual task approval (needs review -> running -> completed)
  const handleApproveTask = async (task: AgentTask) => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    
    // Resume task
    setTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        const updated = {
          ...t,
          status: 'running' as const,
          logs: [...(t.logs || []), `[${new Date().toLocaleTimeString('uk-UA')}] 👍 User approved the proposal. Sending outreach email...`]
        }
        if (activeTask && activeTask.id === task.id) {
          setActiveTask(updated)
        }
        return updated
      }
      return t
    }))

    await sleep(2000)
    
    // Complete
    const res = `Оффер надіслано кандидату. Текст пропозиції затверджено менеджером. Статус: Надіслано.`
    
    setTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        const updated = {
          ...t,
          status: 'completed' as const,
          outputResult: res,
          durationMs: 15400,
          logs: [...(t.logs || []), `[${new Date().toLocaleTimeString('uk-UA')}] ✅ Outreach email successfully dispatched via SMTP. Task completed!`]
        }
        if (activeTask && activeTask.id === task.id) {
          setActiveTask(updated)
        }
        return updated
      }
      return t
    }))

    // Save to database
    try {
      await client.updateAgentTask(task.agentId, task.id, {
        status: 'completed',
        outputResult: res,
        durationMs: 15400
      })
      
      const freshStats = await client.getAgentStats()
      setStats(freshStats)
    } catch (err) {
      console.error(err)
    }
  }

  // Trigger manual refresh of the Materialized View
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

  // Kanban groupings
  const columns = [
    { id: 'pending', title: 'Черга', color: 'border-t-blue-500/80 bg-blue-500/5' },
    { id: 'running', title: 'В роботі', color: 'border-t-purple-500/80 bg-purple-500/5' },
    { id: 'paused', title: 'На затвердженні', color: 'border-t-amber-500/80 bg-amber-500/5 animate-pulse' },
    { id: 'completed', title: 'Виконано', color: 'border-t-emerald-500/80 bg-emerald-500/5' },
    { id: 'failed', title: 'Помилка', color: 'border-t-rose-500/80 bg-rose-500/5' },
  ]

  const tasksByColumn = useMemo(() => {
    const groups: Record<string, AgentTask[]> = {
      pending: [],
      running: [],
      paused: [],
      completed: [],
      failed: [],
    }
    tasks.forEach(t => {
      if (groups[t.status]) {
        groups[t.status].push(t)
      }
    })
    return groups
  }, [tasks])

  return (
    <div className="grid gap-6 p-6 rounded-3xl premium-bg text-zinc-100 shadow-2xl border border-white/5 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[250px] h-[250px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 border-b border-white/10 pb-5">
        <div>
          <Typography variant="h2" className="text-3xl font-extrabold tracking-tight text-white">
            Канбан Автономних Агентів
          </Typography>
          <Typography tone="muted" className="text-zinc-400 mt-1 text-sm font-light">
            Управління ІІ-департаментом, cognitive-логи та аналітика ефективності
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefreshStats} 
            variant="outline" 
            size="sm" 
            className="h-9 gap-1.5 border-white/10 text-zinc-300 hover:bg-white/5 cursor-pointer" 
            disabled={refreshingStats}
          >
            {refreshingStats ? <Spinner className="size-4" /> : <span className="material-symbols-outlined text-sm">refresh</span>}
            Оновити статистику
          </Button>
          <Button 
            onClick={() => setIsBatchOpen(true)} 
            variant="outline" 
            className="h-9 gap-1.5 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-400/50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">layers</span>
            Пакетний запуск
          </Button>
          <Button 
            onClick={() => setIsNewTaskOpen(true)} 
            className="h-9 gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Нове завдання
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 relative z-10">
        {/* Left Side: Agent List & Live Performance Metrics */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="glass-card border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400">smart_toy</span>
                ІІ-Департамент
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">Навантаження та ресурси в реальному часі</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {agents.map(agent => {
                const agentStat = stats.find(s => s.agentId === agent.id)
                const isWorking = agent.metrics.activeTasks > 0
                return (
                  <div 
                    key={agent.id} 
                    className={`rounded-xl border border-white/5 bg-white/[0.02] p-3.5 space-y-3 transition-all duration-300 ${
                      isWorking ? 'agent-pulse-active border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'hover:border-white/10 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${agent.gradient} shadow-inner`}>
                          <span className="material-symbols-outlined text-lg">{agent.icon}</span>
                        </div>
                        <div>
                          <Typography variant="bodySm" className="font-bold text-zinc-100">{agent.name}</Typography>
                          <Typography variant="bodyXs" tone="muted" className="text-zinc-400 line-clamp-1 mt-0.5">{agent.role}</Typography>
                        </div>
                      </div>
                      <Badge 
                        variant={isWorking ? 'default' : 'secondary'} 
                        className={`text-[10px] font-semibold tracking-wider ${
                          isWorking 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50'
                        }`}
                      >
                        {isWorking ? 'Busy' : 'Idle'}
                      </Badge>
                    </div>

                    {/* Dynamic CPU & Memory Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-white/5">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>CPU:</span>
                          <span className={`font-mono font-bold ${isWorking ? 'text-emerald-400' : 'text-zinc-300'}`}>{agent.metrics.cpu}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${isWorking ? 'bg-emerald-400' : 'bg-blue-400'}`} 
                            style={{ width: `${agent.metrics.cpu}%` }} 
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>RAM:</span>
                          <span className="font-mono font-bold text-zinc-300">{agent.metrics.memory}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="bg-purple-400 h-full transition-all duration-500" 
                            style={{ width: `${agent.metrics.memory}%` }} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Materialized View Metrics */}
                    {agentStat && (
                      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/5 text-center text-[10px] text-zinc-400">
                        <div>
                          <span className="block font-extrabold text-white text-xs">{agentStat.totalTasks}</span>
                          Виконано
                        </div>
                        <div>
                          <span className="block font-extrabold text-emerald-400 text-xs">
                            {agentStat.totalTasks > 0 
                              ? `${Math.round((agentStat.completedTasks / agentStat.totalTasks) * 100)}%` 
                              : '100%'}
                          </span>
                          Успішність
                        </div>
                        <div>
                          <span className="block font-extrabold text-white text-xs">
                            {agentStat.avgDurationMs > 0 
                              ? `${Math.round(agentStat.avgDurationMs / 1000)}с` 
                              : '0с'}
                          </span>
                          Сер. час
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Kanban Board */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-full items-start overflow-x-auto pb-4">
              {columns.map(col => {
                const colTasks = tasksByColumn[col.id] || []
                
                // Set glass-card accents
                let colClass = 'glass-card '
                if (col.id === 'pending') colClass += 'glass-card-accent-blue'
                else if (col.id === 'running') colClass += 'glass-card-accent-purple'
                else if (col.id === 'paused') colClass += 'glass-card-accent-amber shadow-[0_0_15px_rgba(245,158,11,0.1)] border-amber-500/20'
                else if (col.id === 'completed') colClass += 'glass-card-accent-emerald'
                else if (col.id === 'failed') colClass += 'glass-card-accent-rose'

                return (
                  <div key={col.id} className={`${colClass} flex flex-col min-w-[200px] max-w-[280px] md:max-w-none flex-1 p-3 h-full min-h-[550px] relative overflow-hidden`}>
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 px-1 relative z-10">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">{col.title}</span>
                      <Badge className="text-[10px] font-bold bg-white/10 text-white hover:bg-white/20 border border-white/10">{colTasks.length}</Badge>
                    </div>

                    {/* Column Body / Cards */}
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1 relative z-10 scrollbar-thin">
                      {colTasks.length > 0 ? (
                        colTasks.map(task => {
                          const agent = agents.find(a => a.id === task.agentId)
                          
                          // Task status custom glows
                          let statusDotColor = 'bg-blue-400'
                          if (task.status === 'running') statusDotColor = 'bg-purple-400 animate-ping'
                          else if (task.status === 'paused') statusDotColor = 'bg-amber-400 animate-pulse'
                          else if (task.status === 'completed') statusDotColor = 'bg-emerald-400'
                          else if (task.status === 'failed') statusDotColor = 'bg-rose-400'

                          return (
                            <div 
                              key={task.id} 
                              onClick={() => setActiveTask(task)}
                              className="group cursor-pointer rounded-xl border border-white/5 bg-white/[0.02] p-3.5 space-y-2.5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-black/20"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <Badge variant="outline" className="text-[9px] font-semibold bg-white/5 border-white/10 px-2 py-0.5 text-zinc-200">
                                  {agent?.name}
                                </Badge>
                                <div className="flex items-center gap-1.5">
                                  <span className={`size-1.5 rounded-full ${statusDotColor}`} />
                                  <span className="text-[9px] font-mono text-zinc-400">
                                    {task.createdAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                              <Typography variant="bodySm" className="font-semibold leading-snug text-white group-hover:text-indigo-400 transition-colors">
                                {task.taskTitle}
                              </Typography>
                              
                              {task.inputParams && (
                                <p className="text-[10px] text-zinc-400 line-clamp-2 italic leading-relaxed border-l-2 border-white/10 pl-2">
                                  Контекст: {task.inputParams}
                                </p>
                              )}

                              {/* Interactive paused validation actions */}
                              {task.status === 'paused' && (
                                <div className="flex gap-2 pt-2 border-t border-white/5" onClick={e => e.stopPropagation()}>
                                  <Button 
                                    onClick={() => handleApproveTask(task)} 
                                    size="xs" 
                                    className="flex-1 text-[10px] py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 font-bold h-7 rounded-lg transition-all cursor-pointer"
                                  >
                                    Затвердити
                                  </Button>
                                  <Button 
                                    onClick={() => updateStatus(task, 'failed')} 
                                    variant="outline" 
                                    size="xs" 
                                    className="text-[10px] py-1.5 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 h-7 rounded-lg transition-all cursor-pointer"
                                  >
                                    Відхилити
                                  </Button>
                                </div>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                          <span className="material-symbols-outlined text-zinc-500/30 text-3xl mb-1.5">inbox</span>
                          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Порожньо</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Task Dialog */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="sm:max-w-[450px] border-white/10 bg-zinc-950/95 backdrop-blur-md rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
          <DialogHeader className="relative z-10 border-b border-white/5 pb-3">
            <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400">add_task</span>
              Поставити завдання ІІ-Агенту
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 mt-1">Оберіть виконавця та заповніть параметри запиту</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-4 py-2 relative z-10">
            <div className="grid gap-2">
              <Label htmlFor="agent" className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Виконавець</Label>
              <select 
                id="agent" 
                value={selectedAgentId} 
                onChange={e => setSelectedAgentId(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm shadow-sm transition-colors text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/30"
              >
                {agents.map(a => <option key={a.id} value={a.id} className="bg-zinc-900 text-zinc-100">{a.name} ({a.role})</option>)}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title" className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Назва Завдання</Label>
              <Input 
                id="title" 
                placeholder="Наприклад: Знайди розробників React..." 
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                required
                className="h-10 bg-black/40 border-white/10 focus-visible:ring-indigo-500/30 text-zinc-100 placeholder:text-zinc-500 rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="input" className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Додаткові інструкції / Вхідні дані</Label>
              <Input 
                id="input" 
                placeholder="Стек: React, TypeScript, Node.js..." 
                value={taskInput}
                onChange={e => setTaskInput(e.target.value)}
                className="h-10 bg-black/40 border-white/10 focus-visible:ring-indigo-500/30 text-zinc-100 placeholder:text-zinc-500 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsNewTaskOpen(false)} className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl h-9 cursor-pointer">
                Скасувати
              </Button>
              <Button type="submit" size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-indigo-500/20 rounded-xl h-9 cursor-pointer">
                Запустити в роботу
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Batch Launch Dialog */}
      <Dialog open={isBatchOpen} onOpenChange={setIsBatchOpen}>
        <DialogContent className="sm:max-w-[550px] border-white/10 bg-zinc-950/95 backdrop-blur-md rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-[250px] h-[250px] bg-purple-500/10 rounded-full blur-[70px] pointer-events-none" />
          <DialogHeader className="border-b border-white/5 pb-3 relative z-10">
            <DialogTitle className="flex items-center gap-2 text-white text-lg font-bold">
              <span className="material-symbols-outlined text-indigo-400">layers</span>
              Пакетний запуск ІІ-Агентів
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 mt-1">
              Налаштування та запуск скоординованої серії завдань під конкретну вакансію або ціль найму
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBatchTasks} className="space-y-4 py-2 relative z-10">
            {/* Template Selection */}
            <div className="grid gap-2">
              <Label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Шаблон процесу</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBatchTemplate('sourcing')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                    batchTemplate === 'sourcing'
                      ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl mb-1 text-indigo-400">search</span>
                  <span className="text-xs">Цикл пошуку</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBatchTemplate('outreach')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                    batchTemplate === 'outreach'
                      ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl mb-1 text-purple-400">mail</span>
                  <span className="text-xs">Скринінг + Outreach</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBatchTemplate('intelligence')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                    batchTemplate === 'intelligence'
                      ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl mb-1 text-amber-400">trending_up</span>
                  <span className="text-xs">Аналіз ринку</span>
                </button>
              </div>
            </div>

            {/* Vacancy Context Input */}
            <div className="grid gap-2">
              <Label htmlFor="batchVacancy" className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Назва вакансії / Загальний контекст</Label>
              <Input
                id="batchVacancy"
                placeholder="Наприклад: Angular Developer, Remote, $3000..."
                value={batchVacancy}
                onChange={e => setBatchVacancy(e.target.value)}
                required
                className="h-10 bg-black/40 border-white/10 focus-visible:ring-indigo-500/30 text-zinc-100 placeholder:text-zinc-500 rounded-xl"
              />
            </div>

            {/* Active Agents tasks list */}
            <div className="grid gap-2 border border-white/5 bg-black/40 rounded-xl p-3 max-h-60 overflow-y-auto scrollbar-thin">
              <span className="text-xs font-bold text-zinc-400 mb-2 block uppercase tracking-wider">
                Склад пакету та персональні завдання:
              </span>
              
              {agents.map(a => {
                const isEnabled = !!batchEnabledAgents[a.id]
                const currentTitle = batchCustomTitles[a.id] || ''

                return (
                  <div key={a.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 ${
                    isEnabled 
                      ? 'border-indigo-500/20 bg-indigo-500/[0.03] shadow-[0_2px_8px_rgba(99,102,241,0.05)]' 
                      : 'border-transparent opacity-50 bg-transparent'
                  }`}>
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={e => setBatchEnabledAgents(prev => ({ ...prev, [a.id]: e.target.checked }))}
                        className="rounded border-white/10 bg-black/40 text-indigo-500 focus:ring-1 focus:ring-indigo-500/50 size-4 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-200">{a.name}</span>
                        <span className="text-[10px] text-zinc-400 truncate max-w-[200px] font-light">({a.role})</span>
                      </div>
                      
                      {isEnabled && (
                        <Input
                          className="h-8 text-xs py-1 animate-in fade-in slide-in-from-top-1 duration-200 bg-black/60 border-white/10 focus-visible:ring-indigo-500/30 text-zinc-200 rounded-lg placeholder:text-zinc-500"
                          value={currentTitle}
                          onChange={e => setBatchCustomTitles(prev => ({ ...prev, [a.id]: e.target.value }))}
                          placeholder="Завдання для агента..."
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsBatchOpen(false)} className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl h-9 cursor-pointer">
                Скасувати
              </Button>
              <Button type="submit" size="sm" className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-indigo-500/20 rounded-xl h-9 cursor-pointer">
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Запустити пакет ({Object.values(batchEnabledAgents).filter(Boolean).length})
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Drawer / Cognitive Console */}
      <Dialog open={activeTask !== null} onOpenChange={open => !open && setActiveTask(null)}>
        {activeTask && (
          <DialogContent className="sm:max-w-[600px] border-white/10 bg-zinc-950/98 backdrop-blur-md rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
            <DialogHeader className="border-b border-white/5 pb-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-base font-extrabold text-white flex items-center gap-2.5">
                    <span className="inline-flex size-2.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                    Cognitive Console
                  </DialogTitle>
                  <DialogDescription className="text-xs text-zinc-400 mt-1 truncate max-w-[400px]">
                    Завдання: {activeTask.taskTitle}
                  </DialogDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-zinc-200 px-2 py-0.5">
                  Виконавець: {agents.find(a => a.id === activeTask.agentId)?.name}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 relative z-10">
              {/* Terminal Logs View */}
              <div className="terminal-glow rounded-xl border border-white/5 bg-[#07090e] p-4.5 font-mono text-[11px] leading-relaxed text-zinc-300 h-64 overflow-y-auto space-y-2.5 shadow-inner scrollbar-thin">
                {activeTask.logs?.map((log, index) => {
                  let colorClass = 'text-zinc-400'
                  if (log.includes('[SUCCESS]') || log.includes('✅')) colorClass = 'text-emerald-400 font-bold drop-shadow-[0_0_6px_rgba(52,211,153,0.15)]'
                  else if (log.includes('[PLAN]') || log.includes('🚀')) colorClass = 'text-indigo-400 font-semibold drop-shadow-[0_0_6px_rgba(129,140,248,0.15)]'
                  else if (log.includes('❌') || log.includes('Failed')) colorClass = 'text-rose-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.15)]'
                  else if (log.includes('⚠️') || log.includes('Awaiting')) colorClass = 'text-amber-400 font-semibold drop-shadow-[0_0_6px_rgba(251,191,36,0.15)]'

                  return (
                    <div key={index} className={`${colorClass} flex items-start gap-1`}>
                      <span className="text-zinc-600 select-none">&gt;</span>
                      <span className="flex-1">{log}</span>
                    </div>
                  )
                })}
                <div ref={terminalEndRef} />
              </div>

              {/* Task Details and Output */}
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 text-zinc-400 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <div>
                    <span className="font-semibold text-white">Запущено:</span>{' '}
                    {activeTask.createdAt.toLocaleString('uk-UA')}
                  </div>
                  <div>
                    <span className="font-semibold text-white">Тривалість:</span>{' '}
                    {activeTask.durationMs ? `${(activeTask.durationMs / 1000).toFixed(2)}с` : 'Виконується...'}
                  </div>
                </div>

                {activeTask.outputResult && (
                  <div className="space-y-2 mt-4">
                    <span className="font-bold text-white block uppercase tracking-wider text-[10px] text-zinc-400">Отриманий результат:</span>
                    <div className="p-3.5 bg-[#0c0e14] border border-white/5 rounded-xl leading-relaxed text-zinc-100 shadow-inner">
                      {activeTask.outputResult}
                    </div>
                  </div>
                )}
              </div>

              {/* Pending Approvals Actions inside Drawer */}
              {activeTask.status === 'paused' && (
                <div className="flex gap-2.5 pt-3 border-t border-white/5">
                  <Button 
                    onClick={() => handleApproveTask(activeTask)} 
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold h-10 text-xs rounded-xl shadow-lg shadow-emerald-500/10 border-0 cursor-pointer"
                  >
                    Затвердити та відправити
                  </Button>
                  <Button 
                    onClick={async () => {
                      // Reject
                      setTasks(prev => prev.map(t => {
                        if (t.id === activeTask.id) {
                          const logs = [...(t.logs || []), `[${new Date().toLocaleTimeString('uk-UA')}] ❌ User rejected the proposal.`]
                          const updated = { ...t, status: 'failed' as const, logs }
                          setActiveTask(updated)
                          return updated
                        }
                        return t
                      }))
                      try {
                        await client.updateAgentTask(activeTask.agentId, activeTask.id, { status: 'failed' })
                      } catch (err) {
                        console.error(err)
                      }
                    }} 
                    variant="outline" 
                    className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 h-10 text-xs rounded-xl cursor-pointer"
                  >
                    Відхилити
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
              <Button variant="ghost" size="sm" onClick={() => setActiveTask(null)} className="text-zinc-400 hover:text-white rounded-xl h-9 cursor-pointer">
                Закрити консоль
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
