import { useState, useMemo } from 'react'
import { useAuth } from '@/lib/use-auth'
import { useDailyDigest, useVacancies, useResumes, useUpcomingTasks, useMatches, useHrClient } from '@/hooks/use-hr'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from '@tanstack/react-router'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface AIEmployee {
  id: string
  name: string
  role: string
  description: string
  status: string
  statusType: 'active' | 'processing' | 'idle'
  gradient: string
  icon: React.ReactNode
}

export function DashboardPage() {
  const auth = useAuth()
  const digest = useDailyDigest()
  const vacancies = useVacancies()
  const resumes = useResumes()
  const tasks = useUpcomingTasks()
  const matches = useMatches()
  const navigate = useNavigate()
  const client = useHrClient()

  const [selectedAgent, setSelectedAgent] = useState<AIEmployee | null>(null)
  const [taskParam1, setTaskParam1] = useState('')
  const [taskParam2, setTaskParam2] = useState('')
  const [loadingSimulation, setLoadingSimulation] = useState(false)
  const [simulationResult, setSimulationResult] = useState<any>(null)

  // Dynamics (last 7 days trend of added Resumes and created Matches)
  const dynamicsData = useMemo(() => {
    if (!resumes.data || !matches.data) return []
    const datesMap: Record<string, { date: string; 'Нові резюме': number; 'Нові матчі': number }> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
      datesMap[dateStr] = { date: dateStr, 'Нові резюме': 0, 'Нові матчі': 0 }
    }
    resumes.data.forEach((r: any) => {
      const dateStr = new Date(r.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
      if (dateStr in datesMap) {
        datesMap[dateStr]['Нові резюме']++
      }
    })
    matches.data.forEach((m: any) => {
      const dateStr = new Date(m.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
      if (dateStr in datesMap) {
        datesMap[dateStr]['Нові матчі']++
      }
    })
    return Object.values(datesMap)
  }, [resumes.data, matches.data])

  const avgMatchScore = useMemo(() => {
    if (!matches.data || matches.data.length === 0) return 0
    return Math.round(matches.data.reduce((sum: number, m: any) => sum + m.score, 0) / matches.data.length)
  }, [matches.data])

  const isLoading = digest.isLoading || vacancies.isLoading || resumes.isLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    )
  }

  const stats = [
    { label: 'Вакансій', value: vacancies.data?.length ?? 0, path: '/app/vacancies', color: 'bg-blue-500' },
    { label: 'Резюме', value: resumes.data?.length ?? 0, path: '/app/resumes', color: 'bg-green-500' },
    { label: 'Матчів', value: matches.data?.length ?? 0, path: '/app/matches', color: 'bg-purple-500' },
    { label: 'Завдань сьогодні', value: tasks.data?.length ?? 0, path: '/app/tasks', color: 'bg-orange-500' },
  ]

  const aiEmployees: AIEmployee[] = [
    {
      id: 'marta',
      name: 'Марта',
      role: 'ІІ-Сорсер (Sourcing Specialist)',
      description: 'Автоматичний пошук резюме та вакансій на Work.ua, Robota.ua та LinkedIn за ключовими запитами.',
      status: 'Сорсить кандидатів на позицію React Developer',
      statusType: 'active',
      gradient: 'from-blue-600 to-indigo-600',
      icon: (
        <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      id: 'artur',
      name: 'Артур',
      role: 'ІІ-Асесор (Assessment Expert)',
      description: 'Аналіз резюме, розрахунок відсотка відповідності вимогам (Match Score) та генерація запитань для інтерв’ю.',
      status: 'Очікує нових кандидатів для скорингу',
      statusType: 'idle',
      gradient: 'from-emerald-600 to-teal-600',
      icon: (
        <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'sofia',
      name: 'Софія',
      role: 'ІІ-Координатор (Outreach Specialist)',
      description: 'Написання персоналізованих супровідних листів та пропозицій, ведення журналів комунікації.',
      status: 'У процесі: Формує пропозицію для Java Developer',
      statusType: 'processing',
      gradient: 'from-purple-600 to-pink-600',
      icon: (
        <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'danilo',
      name: 'Данило',
      role: 'ІІ-Аналітик (HR Analyst)',
      description: 'Моніторинг зарплатних вилок, підготовка аналітичних звітів по ринку праці та розрахунок статистики.',
      status: 'Вільний: Готовий проаналізувати медіану зарплат',
      statusType: 'idle',
      gradient: 'from-amber-600 to-orange-600',
      icon: (
        <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'maksym',
      name: 'Максим',
      role: 'ІІ-Монітор Зарплат (Salary Monitor)',
      description: 'Відстеження змін зарплатних вилок по вакансіях, порівняння з бюджетом компанії та сповіщення про відхилення.',
      status: 'Вільний: Готовий порівняти вакансії з ринком',
      statusType: 'idle',
      gradient: 'from-cyan-600 to-blue-600',
      icon: (
        <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'olena',
      name: 'Олена',
      role: 'ІІ-Розвідник Конкурентів (Competitor Specialist)',
      description: 'Моніторинг вакансій компаній-конкурентів, сигналізація про відкриття та закриття вакансій.',
      status: 'Вільна: Готова проаналізувати активність конкурентів',
      statusType: 'idle',
      gradient: 'from-rose-600 to-red-600',
      icon: (
        <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    }
  ]

  const handleOpenDialog = (agent: AIEmployee) => {
    setSelectedAgent(agent)
    setTaskParam1('')
    setTaskParam2('')
    setSimulationResult(null)
    setLoadingSimulation(false)
  }

  const handleExecuteTask = async () => {
    if (!selectedAgent) return

    setLoadingSimulation(true)
    setSimulationResult(null)

    try {
      if (selectedAgent.id === 'marta') {
        const res = await client.aiExpandSearch({ text: taskParam1 || 'React' })
        setSimulationResult({
          type: 'sourcing',
          ...res
        })
      } else if (selectedAgent.id === 'sofia') {
        const res = await client.aiGenerateOutreach({
          candidateName: taskParam1 || 'Олександр Коваленко',
          candidatePosition: taskParam2 || 'React Developer',
          vacancyTitle: taskParam2 || 'React Developer'
        })
        setSimulationResult({
          type: 'email',
          ...res
        })
      } else if (selectedAgent.id === 'danilo') {
        const res = await client.aiAnalyzeSalary({
          position: taskParam1 || 'React Developer'
        })
        setSimulationResult({
          type: 'salary',
          ...res
        })
      } else if (selectedAgent.id === 'artur') {
        const res = await client.analyzeMatch({
          vacancy: { title: taskParam1 || 'React Developer', description: 'Необхідні навички: React, TypeScript, Node.js' },
          resume: { name: 'Кандидат', position: taskParam1 || 'React Developer', skills: ['React', 'TypeScript'] }
        })
        setSimulationResult({
          type: 'assessment',
          ...res
        })
      } else if (selectedAgent.id === 'maksym') {
        const res = await client.aiTrackSalary({
          position: taskParam1 || 'React Developer',
          budget: Number(taskParam2) || 2500
        })
        setSimulationResult({
          type: 'salary-track',
          ...res
        })
      } else if (selectedAgent.id === 'olena') {
        const res = await client.aiTrackCompetitors({
          company: taskParam1 || 'SoftServe',
          niche: taskParam2 || 'FinTech'
        })
        setSimulationResult({
          type: 'competitor-track',
          ...res
        })
      }
    } catch (e) {
      console.warn('API call failed or key missing, falling back to simulated output:', e)
      // Fallbacks
      if (selectedAgent.id === 'sofia') {
        setSimulationResult({
          type: 'email',
          subject: `Пропозиція співпраці: позиція "${taskParam2 || 'React Developer'}"`,
          content: `Шановний ${taskParam1 || 'кандидате'},\n\n` +
            `Мене звати Софія, я ІІ-Координатор компанії. Ми переглянули ваше резюме на позицію "${taskParam2 || 'React Developer'}" і воно нас надзвичайно зацікавило.\n\n` +
            `Ваш досвід та технічні навички дуже добре відповідають вимогам нашої команди. Ми б хотіли запросити вас на коротке ознайомче інтерв'ю (15-20 хвилин), щоб детальніше обговорити можливості нашої співпраці.\n\n` +
            `Будь ласка, повідомте, які дні та години цього тижня будуть для вас зручними для дзвінка.\n\n` +
            `З повагою,\nСофія та HR-команда`
        })
      } else if (selectedAgent.id === 'danilo') {
        const baseSalary = taskParam1.toLowerCase().includes('senior') ? 4000 : taskParam1.toLowerCase().includes('junior') ? 1000 : 2500
        setSimulationResult({
          type: 'salary',
          position: taskParam1 || 'React Developer',
          min: baseSalary - Math.round(baseSalary * 0.2),
          median: baseSalary,
          max: baseSalary + Math.round(baseSalary * 0.3),
          currency: 'USD',
          demand: taskParam1.toLowerCase().includes('react') || taskParam1.toLowerCase().includes('node') ? 'Високий' : 'Середній',
          advice: `Рекомендується орієнтуватися на бюджет $${baseSalary} для зменшення терміну закриття вакансії.`
        })
      } else if (selectedAgent.id === 'artur') {
        setSimulationResult({
          type: 'assessment',
          score: 85,
          pros: [
            'Глибоке знання основного стека (TypeScript/React)',
            'Досвід роботи з RESTful API та оптимізацією інтерфейсів',
            'Розуміння CI/CD процесів'
          ],
          cons: [
            'Недостатній досвід роботи з Docker контейнеризацією',
            'Рідкісна участь в архітектурному плануванні на попередніх проектах'
          ],
          questions: [
            'Розкажіть про свій досвід оптимізації рендерингу складних React-компонентів.',
            'Як ви організовуєте управління глобальним станом у великих додатках?'
          ]
        })
      } else if (selectedAgent.id === 'marta') {
        setSimulationResult({
          type: 'sourcing',
          expansions: [taskParam1 || 'React', 'ReactJS', 'React Native', 'React.js'],
          titles: [`${taskParam1 || 'React'} Developer`, `Software Engineer ${taskParam1 || 'React'}`],
          booleanSearch: `"${taskParam1 || 'React'}" AND ("developer" OR "engineer")`
        })
      } else if (selectedAgent.id === 'maksym') {
        const budget = Number(taskParam2) || 2500
        const marketMedian = taskParam1.toLowerCase().includes('senior') ? 4000 : taskParam1.toLowerCase().includes('junior') ? 1200 : 2500
        const comparison = budget > marketMedian + 500 ? 'above_market' : budget < marketMedian - 500 ? 'below_market' : 'within_market'
        const alertTriggered = comparison === 'below_market'
        setSimulationResult({
          type: 'salary-track',
          position: taskParam1 || 'React Developer',
          budget,
          marketMedian,
          comparison,
          alertTriggered,
          advice: alertTriggered
            ? `Увага! Бюджет $${budget} значно нижче ринкової медіани ($${marketMedian}). Рекомендується збільшити пропозицію або знизити вимоги до кандидатів.`
            : `Бюджет $${budget} знаходиться в межах ринкової медіани ($${marketMedian}). Чудова пропозиція для швидкого найму.`
        })
      } else if (selectedAgent.id === 'olena') {
        const company = taskParam1 || 'SoftServe'
        const niche = taskParam2 || 'FinTech'
        setSimulationResult({
          type: 'competitor-track',
          company,
          niche,
          activeVacancies: [
            { title: `${niche} Developer`, dateOpened: '2026-05-18' },
            { title: `Senior QA Engineer (${niche})`, dateOpened: '2026-05-15' }
          ],
          closedVacancies: [
            { title: `Product Manager`, dateClosed: '2026-05-10' }
          ],
          alertLevel: 'medium',
          report: `Компанія ${company} активно розширює присутність у сфері ${niche}. Останнім часом відкрито 2 нові вакансії інженерів та закрито вакансію PM, що вказує на перехід до фази активної реалізації продуктів.`
        })
      }
    } finally {
      setLoadingSimulation(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <Typography variant="h2">Привіт, {auth.user?.displayName || auth.user?.email}!</Typography>
        <Typography tone="muted">Ваша HR-панель керування та ІІ-асистенти</Typography>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>{stat.label}</CardDescription>
                <div className={`h-2 w-2 rounded-full ${stat.color}`} />
              </div>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" size="sm">
                <Link to={stat.path}>Детальніше</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily Digest & Mini Analytics */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Daily Digest */}
        {digest.data && (
          <Card className="lg:col-span-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Щоденне зведення</CardTitle>
                  <CardDescription className="text-xs">Нове за останні 24 години</CardDescription>
                </div>
                <Badge variant="secondary" className="text-[10px]">{new Date(digest.data.date).toLocaleDateString('uk-UA')}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 border border-white/5">
                <span className="text-xs text-muted-foreground">Нових вакансій</span>
                <span className="text-lg font-bold text-blue-400">{digest.data.newVacancies}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 border border-white/5">
                <span className="text-xs text-muted-foreground">Нових резюме</span>
                <span className="text-lg font-bold text-emerald-400">{digest.data.newResumes}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 border border-white/5">
                <span className="text-xs text-muted-foreground">Нових матчів</span>
                <span className="text-lg font-bold text-purple-400">{digest.data.newMatches}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mini Analytics widget */}
        <Card className="lg:col-span-8 flex flex-col justify-between hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Активність рекрутингу</CardTitle>
                <CardDescription className="text-xs">Динаміка завантаження резюме та матчів</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline" className="text-xs h-8">
                <Link to="/app/analytics">Аналітична панель</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-6 flex-1 items-center py-3">
            {/* Charts representation */}
            <div className="sm:col-span-2 h-36">
              {dynamicsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dynamicsData}
                    margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="miniResumes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="Нові резюме" stroke="#10b981" fillOpacity={1} fill="url(#miniResumes)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-xs text-muted-foreground">Немає даних</span>
                </div>
              )}
            </div>
            
            {/* Avg Match score card */}
            <div className="flex flex-col items-center justify-center p-4 bg-muted/40 rounded-xl border border-white/5 text-center h-full">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Середній Match Score</span>
              <span className="text-4xl font-extrabold text-teal-400 mb-1">{avgMatchScore}%</span>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: `${avgMatchScore}%` }} />
              </div>
              <span className="text-[9px] text-muted-foreground mt-2">Якість підбору</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid containing Tasks (Left) and AI Team (Right) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Upcoming Tasks */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Найближчі завдання</CardTitle>
                  <CardDescription>На найближчі 24 години</CardDescription>
                </div>
                <Button asChild size="sm">
                  <Link to="/app/tasks">Усі завдання</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tasks.data && tasks.data.length > 0 ? (
                <div className="space-y-3">
                  {tasks.data.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <Typography variant="bodySm" className="font-medium">{task.title}</Typography>
                        <Typography variant="bodySm" tone="muted">
                          {new Date(task.scheduledAt).toLocaleString('uk-UA')}
                        </Typography>
                      </div>
                      <Badge variant={task.eventType === 'interview' ? 'default' : 'secondary'}>
                        {task.eventType === 'interview' ? 'Співбесіда' : task.eventType === 'call' ? 'Дзвінок' : 'Зустріч'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <Typography tone="muted" className="text-center py-8">Немає найближчих завдань</Typography>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI HR Team Widget */}
        <div className="lg:col-span-7">
          <Card className="h-full border-primary/20 bg-gradient-to-br from-card to-secondary/5">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="inline-flex size-2 rounded-full bg-primary animate-pulse" />
                  ІІ-Команда HR-Департаменту
                </CardTitle>
                <CardDescription>Узгоджена робота розумних агентів під вашим наглядом</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {aiEmployees.map((agent) => (
                  <div key={agent.id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-white/5 bg-card/40 p-4 transition-all duration-200 hover:border-primary/25 hover:bg-card/75">
                    {/* Avatar with gradient */}
                    <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${agent.gradient} shadow-md`}>
                      {agent.icon}
                    </div>

                    {/* Employee Profile info */}
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-card-foreground">{agent.name}</span>
                        <span className="text-xs text-muted-foreground">({agent.role})</span>
                        
                        {/* Status badge with pulsing dot */}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="relative flex h-2 w-2">
                            {agent.statusType !== 'idle' && (
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${agent.statusType === 'active' ? 'bg-emerald-400' : 'bg-purple-400'}`}></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${agent.statusType === 'active' ? 'bg-emerald-500' : agent.statusType === 'processing' ? 'bg-purple-500' : 'bg-muted-foreground/50'}`}></span>
                          </span>
                          <span className="text-[10px] uppercase font-medium text-muted-foreground">{agent.statusType === 'idle' ? 'В очікуванні' : 'В роботі'}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal">{agent.description}</p>
                      
                      {/* Active Status line */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-medium text-primary/80">Статус:</span>
                        <span className="text-[11px] italic text-muted-foreground">{agent.status}</span>
                      </div>
                    </div>

                    {/* Action button */}
                    <Button onClick={() => handleOpenDialog(agent)} variant="outline" size="sm" className="sm:self-center shrink-0 border-primary/20 hover:border-primary hover:bg-primary/5">
                      Дати завдання
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Delegation Dialog Modal */}
      <Dialog open={selectedAgent !== null} onOpenChange={(open) => !open && setSelectedAgent(null)}>
        {selectedAgent && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <div className="flex items-center gap-3 pb-2 border-b">
                <div className={`flex size-10 items-center justify-center rounded-lg bg-gradient-to-br ${selectedAgent.gradient}`}>
                  {selectedAgent.icon}
                </div>
                <div>
                  <DialogTitle className="text-lg">Завдання для {selectedAgent.name}</DialogTitle>
                  <DialogDescription className="text-xs">{selectedAgent.role}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Form Input fields depending on the selected Agent */}
              {selectedAgent.id === 'marta' && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="searchQuery">Стек технологій або посада для пошуку</Label>
                    <Input
                      id="searchQuery"
                      placeholder="Наприклад: React Developer, Node.js Senior..."
                      value={taskParam1}
                      onChange={(e) => setTaskParam1(e.target.value)}
                    />
                  </div>
                  <Typography variant="bodySm" tone="muted">
                    Марта автоматично знайде резюме та вакансії по цьому запиту на сайтах-партнерах.
                  </Typography>
                </div>
              )}

              {selectedAgent.id === 'artur' && (
                <div className="space-y-4">
                  <Typography variant="bodySm" className="font-medium text-foreground">
                    Артур оцінює відповідність кандидатів вимогам конкретної вакансії.
                  </Typography>
                  <Typography variant="bodySm" tone="muted">
                    Для оцінки кандидата перейдіть у розділ <strong>"Матчі"</strong> або відкрийте картку будь-якого кандидата і натисніть кнопку <strong>"Аналізувати сумісність"</strong>.
                  </Typography>
                  <div className="rounded-lg bg-muted/50 p-3 border border-white/5 space-y-2">
                    <span className="text-xs font-semibold uppercase text-primary tracking-wider">Швидка симуляція оцінки:</span>
                    <div className="grid gap-2">
                      <Label htmlFor="assessRole">Назва Вакансії</Label>
                      <Input
                        id="assessRole"
                        placeholder="React Developer"
                        value={taskParam1}
                        onChange={(e) => setTaskParam1(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedAgent.id === 'sofia' && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="candidateName">Ім'я кандидата</Label>
                    <Input
                      id="candidateName"
                      placeholder="Олександр Коваленко"
                      value={taskParam1}
                      onChange={(e) => setTaskParam1(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="candidatePos">Посада</Label>
                    <Input
                      id="candidatePos"
                      placeholder="Node.js Developer"
                      value={taskParam2}
                      onChange={(e) => setTaskParam2(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {selectedAgent.id === 'danilo' && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="salaryPosition">Назва вакансії / Стек для аналізу ринку</Label>
                    <Input
                      id="salaryPosition"
                      placeholder="Senior JavaScript Engineer"
                      value={taskParam1}
                      onChange={(e) => setTaskParam1(e.target.value)}
                    />
                  </div>
                  <Typography variant="bodySm" tone="muted">
                    Данило проаналізує зарплатні вилки, медіану ринку та дасть рекомендації щодо бюджету.
                  </Typography>
                </div>
              )}

              {selectedAgent.id === 'maksym' && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="trackSalaryPosition">Посада для моніторингу</Label>
                    <Input
                      id="trackSalaryPosition"
                      placeholder="React Developer"
                      value={taskParam1}
                      onChange={(e) => setTaskParam1(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="trackSalaryBudget">Бюджет компанії (USD)</Label>
                    <Input
                      id="trackSalaryBudget"
                      type="number"
                      placeholder="2500"
                      value={taskParam2}
                      onChange={(e) => setTaskParam2(e.target.value)}
                    />
                  </div>
                  <Typography variant="bodySm" tone="muted">
                    Максим порівняє бюджет вакансії з актуальними ринковими даними та надішле попередження у разі суттєвого відхилення.
                  </Typography>
                </div>
              )}

              {selectedAgent.id === 'olena' && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="competitorCompany">Компанія-конкурент</Label>
                    <Input
                      id="competitorCompany"
                      placeholder="SoftServe"
                      value={taskParam1}
                      onChange={(e) => setTaskParam1(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="competitorNiche">Ніша або напрямок</Label>
                    <Input
                      id="competitorNiche"
                      placeholder="FinTech"
                      value={taskParam2}
                      onChange={(e) => setTaskParam2(e.target.value)}
                    />
                  </div>
                  <Typography variant="bodySm" tone="muted">
                    Олена здійснить розвідку відкритих вакансій конкурента у вказаній ніші та сформує аналітичний звіт.
                  </Typography>
                </div>
              )}

              {/* Progress animation loader */}
              {loadingSimulation && (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <Spinner className="size-8 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground animate-pulse">Агент аналізує дані та генерує звіт...</span>
                </div>
              )}

              {/* Result output window */}
              {simulationResult && (
                <div className="mt-2 space-y-3 rounded-lg border bg-muted/30 p-4">
                  {simulationResult.type === 'email' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b pb-1 text-xs text-muted-foreground font-semibold">
                        <span>Тема: {simulationResult.subject}</span>
                        <Badge variant="outline">Email Outreach</Badge>
                      </div>
                      <pre className="text-xs font-sans whitespace-pre-wrap leading-relaxed text-card-foreground bg-black/20 p-2.5 rounded border border-white/5 font-mono">
                        {simulationResult.content}
                      </pre>
                      <Button onClick={() => {
                        navigator.clipboard.writeText(simulationResult.content)
                      }} size="sm" className="w-full">
                        Скопіювати в буфер обміну
                      </Button>
                    </div>
                  )}

                  {simulationResult.type === 'salary' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-1.5 font-semibold text-sm">
                        <span className="text-foreground">Аналітика зарплат: {simulationResult.position}</span>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400">Аналіз ринку</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-muted p-2 rounded border">
                          <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Мінімум</span>
                          <span className="text-sm font-bold text-foreground">${simulationResult.min}</span>
                        </div>
                        <div className="bg-primary/10 border-primary/20 p-2 rounded border">
                          <span className="block text-[10px] text-primary/80 uppercase font-semibold">Медіана</span>
                          <span className="text-sm font-bold text-primary">${simulationResult.median}</span>
                        </div>
                        <div className="bg-muted p-2 rounded border">
                          <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Максимум</span>
                          <span className="text-sm font-bold text-foreground">${simulationResult.max}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Попит на ринку:</span>
                          <span className="font-semibold text-primary">{simulationResult.demand}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground italic leading-relaxed pt-1.5 border-t border-white/5">
                          {simulationResult.advice}
                        </p>
                      </div>
                    </div>
                  )}

                  {simulationResult.type === 'assessment' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-1.5 font-semibold text-sm">
                        <span className="text-foreground">Асесмент відповідності</span>
                        <Badge variant="secondary" className="bg-teal-500/10 text-teal-400">
                          Match Score: {simulationResult.score}%
                        </Badge>
                      </div>
                      <div className="space-y-2 text-left">
                        <div>
                          <span className="text-xs font-semibold text-emerald-400 block mb-1">Сильні сторони:</span>
                          <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                            {simulationResult.pros.map((p: string, i: number) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-rose-400 block mb-1">Ризики / Слабкі сторони:</span>
                          <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                            {simulationResult.cons.map((c: string, i: number) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-primary block mb-1">Рекомендовані питання для інтерв'ю:</span>
                          <ol className="list-decimal pl-4 text-xs text-muted-foreground space-y-1">
                            {simulationResult.questions.map((q: string, i: number) => <li key={i}>{q}</li>)}
                          </ol>
                        </div>
                      </div>
                    </div>
                  )}

                  {simulationResult.type === 'sourcing' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-1.5 font-semibold text-sm">
                        <span className="text-foreground">Сорсинг запит розширено</span>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400">Розширення пошуку</Badge>
                      </div>
                      <div className="space-y-2 text-left text-xs text-muted-foreground">
                        <div>
                          <span className="font-semibold text-card-foreground">Синоніми та розширення:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {simulationResult.expansions?.map((term: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">{term}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold text-card-foreground">Суміжні посади:</span>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            {simulationResult.titles?.map((title: string, i: number) => (
                              <li key={i}>{title}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-semibold text-card-foreground">Boolean рядок пошуку:</span>
                          <code className="block bg-black/20 p-2 rounded mt-1 font-mono text-[10px] select-all cursor-pointer">
                            {simulationResult.booleanSearch}
                          </code>
                        </div>
                      </div>
                      <Button onClick={() => {
                        navigate({
                          to: '/app/search',
                          search: {
                            text: taskParam1 || 'React',
                            type: 'vacancy',
                            source: 'all',
                            page: 0
                          }
                        })
                        setSelectedAgent(null)
                      }} className="w-full mt-2" size="sm">
                        Перейти до результатів пошуку
                      </Button>
                    </div>
                  )}

                  {simulationResult.type === 'salary-track' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-1.5 font-semibold text-sm">
                        <span className="text-foreground">Аналітика бюджету: {simulationResult.position}</span>
                        <Badge variant={simulationResult.alertTriggered ? 'destructive' : 'outline'} className={!simulationResult.alertTriggered ? 'bg-emerald-500/10 text-emerald-400' : ''}>
                          {simulationResult.comparison === 'above_market' ? 'Вище ринку' : simulationResult.comparison === 'within_market' ? 'В межах ринку' : 'Нижче ринку'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-muted p-2 rounded border">
                          <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Наш бюджет</span>
                          <span className="text-sm font-bold text-foreground">${simulationResult.budget}</span>
                        </div>
                        <div className="bg-muted p-2 rounded border">
                          <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Медіана ринку</span>
                          <span className="text-sm font-bold text-foreground">${simulationResult.marketMedian}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] text-muted-foreground italic leading-relaxed pt-1.5 border-t border-white/5">
                          {simulationResult.advice}
                        </p>
                      </div>
                    </div>
                  )}

                  {simulationResult.type === 'competitor-track' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-1.5 font-semibold text-sm">
                        <span className="text-foreground">Розвідка конкурента: {simulationResult.company}</span>
                        <Badge variant={simulationResult.alertLevel === 'high' ? 'destructive' : simulationResult.alertLevel === 'medium' ? 'default' : 'secondary'}>
                          Загроза: {simulationResult.alertLevel === 'high' ? 'Висока' : simulationResult.alertLevel === 'medium' ? 'Середня' : 'Низька'}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-left text-xs">
                        <div>
                          <span className="font-semibold text-card-foreground">Активні вакансії ({simulationResult.niche}):</span>
                          <ul className="list-disc pl-4 mt-1 space-y-1 text-muted-foreground">
                            {simulationResult.activeVacancies?.map((v: any, i: number) => (
                              <li key={i}>{v.title} <span className="text-[10px] text-muted-foreground/70">(відкрита: {v.dateOpened})</span></li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-semibold text-card-foreground">Закриті вакансії:</span>
                          <ul className="list-disc pl-4 mt-1 space-y-1 text-muted-foreground">
                            {simulationResult.closedVacancies?.map((v: any, i: number) => (
                              <li key={i}>{v.title} <span className="text-[10px] text-muted-foreground/70">(закрита: {v.dateClosed})</span></li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-[11px] text-muted-foreground italic leading-relaxed pt-1.5 border-t border-white/5">
                          {simulationResult.report}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedAgent(null)}>
                Закрити
              </Button>
              {!simulationResult && !loadingSimulation && (
                <Button size="sm" onClick={handleExecuteTask}>
                  {selectedAgent.id === 'marta' ? 'Запустити пошук' : 'Доручити роботу'}
                </Button>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
