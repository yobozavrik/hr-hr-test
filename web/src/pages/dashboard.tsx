import { useMemo } from 'react'
import { useAuth } from '@/lib/use-auth'
import { useVacancies, useResumes, useUpcomingTasks, useMatches } from '@/hooks/use-hr'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500',
  processing: 'bg-amber-500',
  idle: 'bg-zinc-400',
}

const aiEmployees = [
  { id: 'marta', name: 'Марта', role: 'Сорсер', gradient: 'from-blue-500 to-indigo-500', status: 'active' as const, description: 'Шукає кандидатів на React Developer' },
  { id: 'artur', name: 'Артур', role: 'Аналітик', gradient: 'from-emerald-500 to-teal-500', status: 'idle' as const, description: 'Очікує задачу' },
  { id: 'sofia', name: 'Софія', role: 'Screening', gradient: 'from-purple-500 to-pink-500', status: 'processing' as const, description: 'Аналізує 5 резюме' },
  { id: 'danilo', name: 'Данило', role: 'Інтерв\'ю', gradient: 'from-amber-500 to-orange-500', status: 'idle' as const, description: 'Готовий планувати інтерв\'ю' },
  { id: 'maksym', name: 'Максим', role: 'Офери', gradient: 'from-cyan-500 to-blue-500', status: 'idle' as const, description: 'Готовий формувати офери' },
  { id: 'olena', name: 'Олена', role: 'Звіти', gradient: 'from-rose-500 to-red-500', status: 'idle' as const, description: 'Готова готувати звіти' },
]

export function DashboardPage() {
  const auth = useAuth()
  const vacancies = useVacancies()
  const resumes = useResumes()
  const tasks = useUpcomingTasks()
  const matches = useMatches()

  const dynamicsData = useMemo(() => {
    if (!resumes.data || !matches.data) return []
    const datesMap: Record<string, { date: string; resumes: number; matches: number }> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
      datesMap[dateStr] = { date: dateStr, resumes: 0, matches: 0 }
    }
    resumes.data.forEach((r: { createdAt: string }) => {
      const dateStr = new Date(r.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
      if (dateStr in datesMap) datesMap[dateStr].resumes++
    })
    matches.data.forEach((m: { createdAt: string }) => {
      const dateStr = new Date(m.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
      if (dateStr in datesMap) datesMap[dateStr].matches++
    })
    return Object.values(datesMap)
  }, [resumes.data, matches.data])

  const avgMatchScore = useMemo(() => {
    if (!matches.data || matches.data.length === 0) return 0
    return Math.round(matches.data.reduce((sum: number, m: { score: number }) => sum + m.score, 0) / matches.data.length)
  }, [matches.data])

  const isLoading = vacancies.isLoading || resumes.isLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /></CardContent></Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4"><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-[250px] w-full" /></CardContent></Card>
          <Card className="col-span-3"><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'Вакансій', value: vacancies.data?.length ?? 0, path: '/app/vacancies', icon: 'briefcase', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Резюме', value: resumes.data?.length ?? 0, path: '/app/resumes', icon: 'file-text', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Матчів', value: matches.data?.length ?? 0, path: '/app/matches', icon: 'git-merge', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Завдань сьогодні', value: tasks.data?.length ?? 0, path: '/app/tasks', icon: 'calendar-check', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  ]

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2">
            Добрий день, {auth.user?.displayName || auth.user?.email}!
          </Typography>
          <Typography tone="muted" className="mt-1">
            Ваша HR-панель керування
          </Typography>
        </div>
      </div>

      {/* KPI Cards — 12-col grid, col-3 each */}
      <div className="grid grid-cols-12 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="col-span-12 sm:col-span-6 lg:col-span-3">
            <Card className="hover:shadow-md transition-shadow h-[120px]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={cn('flex size-10 items-center justify-center rounded-lg', stat.bg)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={stat.color}>
                    {stat.icon === 'briefcase' && <><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>}
                    {stat.icon === 'file-text' && <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></>}
                    {stat.icon === 'git-merge' && <><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 21V9a9 9 0 0 0 9 9" /></>}
                    {stat.icon === 'calendar-check' && <><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="m9 16 2 2 4-4" /></>}
                  </svg>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild variant="ghost" size="sm" className="-ml-2 h-auto p-0 text-muted-foreground hover:text-foreground">
                <Link to={stat.path} className="text-sm">
                  Детальніше →
                </Link>
              </Button>
            </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Chart + AI Team — 12-col grid, col-6 each */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6">
        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>Динаміка за 7 днів</CardTitle>
            <CardDescription>Нові резюме та матчі</CardDescription>
          </CardHeader>
          <CardContent>
            {dynamicsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={dynamicsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="resumes" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Резюме" />
                  <Area type="monotone" dataKey="matches" stackId="2" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} name="Матчі" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-muted-foreground">
                Немає даних
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        {/* AI Team — col-6 */}
        <div className="col-span-12 lg:col-span-6">
        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>AI HR Команда</CardTitle>
            <CardDescription>6 агентів для автоматизації рекрутингу</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {aiEmployees.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white text-xs font-bold', agent.gradient)}>
                    {agent.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Typography variant="bodySm" className="font-medium truncate">{agent.name}</Typography>
                      <span className={cn('inline-flex size-2 rounded-full', statusColors[agent.status])} />
                    </div>
                    <Typography variant="caption" tone="muted">{agent.role}</Typography>
                    <Typography variant="caption" className="mt-1 block truncate">{agent.description}</Typography>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Top Matches (col-8) + Tasks (col-4) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Топ матчі</CardTitle>
                <CardDescription>Найкращі співпадіння сьогодні</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/app/matches">Усі матчі</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {matches.data && matches.data.length > 0 ? (
              <div className="space-y-3">
                {matches.data
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 5)
                  .map((match) => (
                    <div key={match.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'flex size-10 items-center justify-center rounded-full text-sm font-bold text-white',
                          match.score >= 70 ? 'bg-emerald-500' : match.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                        )}>
                          {match.score}%
                        </div>
                        <div>
                          <Typography variant="bodySm" className="font-medium">
                            {match.resume?.fullName} → {match.vacancy?.title}
                          </Typography>
                          <Typography variant="caption" tone="muted">{match.resume?.position}</Typography>
                        </div>
                      </div>
                      <Badge variant={match.score >= 70 ? 'default' : match.score >= 40 ? 'secondary' : 'destructive'}>
                        {match.score >= 70 ? 'Сильний' : match.score >= 40 ? 'Середній' : 'Низький'}
                      </Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Typography tone="muted">Немає матчів</Typography>
                <Button asChild variant="link" size="sm" className="mt-2">
                  <Link to="/app/matches">Створити перший матч</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        {/* Tasks + Avg Score — col-4 */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Avg Match Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Середній матч-скор</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="relative flex size-24 items-center justify-center">
                  <svg className="size-24 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={avgMatchScore >= 70 ? 'hsl(var(--chart-4))' : avgMatchScore >= 40 ? 'hsl(var(--chart-5))' : 'hsl(var(--destructive))'} strokeWidth="3" strokeDasharray={`${avgMatchScore}, 100`} strokeLinecap="round" />
                  </svg>
                  <Typography variant="h3" className="absolute">{avgMatchScore}%</Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Завдання сьогодні</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/app/tasks">Усі</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tasks.data && tasks.data.length > 0 ? (
                <div className="space-y-2">
                  {tasks.data.slice(0, 4).map((task: { id: string; title: string; scheduledAt: string; eventType: string }) => (
                    <div key={task.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                      <div className={cn(
                        'size-2 shrink-0 rounded-full',
                        task.eventType === 'interview' ? 'bg-blue-500' : task.eventType === 'call' ? 'bg-emerald-500' : 'bg-purple-500'
                      )} />
                      <div className="min-w-0 flex-1">
                        <Typography variant="bodySm" className="font-medium truncate">{task.title}</Typography>
                        <Typography variant="caption" tone="muted">
                          {new Date(task.scheduledAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {task.eventType === 'interview' ? 'Співбесіда' : task.eventType === 'call' ? 'Дзвінок' : 'Зустріч'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <Typography tone="muted">Немає завдань</Typography>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
