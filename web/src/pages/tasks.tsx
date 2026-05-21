import { useState, useMemo } from 'react'
import { useTasks, useCreateTask, useDeleteTask } from '@/hooks/use-hr'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description?: string | null
  eventType: 'interview' | 'call' | 'meeting'
  scheduledAt: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode; dotColor: string }> = {
  interview: {
    label: 'Співбесіда',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    dotColor: 'bg-blue-500',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  call: {
    label: 'Дзвінок',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    dotColor: 'bg-emerald-500',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  },
  meeting: {
    label: 'Зустріч',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    dotColor: 'bg-purple-500',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  },
}

function CalendarView({ tasks }: { tasks: Task[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDay = firstDay === 0 ? 6 : firstDay - 1

  const monthName = currentDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {}
    tasks.forEach(t => {
      const d = new Date(t.scheduledAt)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map[key]) map[key] = []
      map[key].push(t)
    })
    return map
  }, [tasks])

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const today = new Date()
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const days: (number | null)[] = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={prevMonth}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Button>
        <Typography variant="h4" className="capitalize">{monthName}</Typography>
        <Button variant="outline" size="sm" onClick={nextMonth}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(d => (
          <div key={d} className="bg-muted/50 py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
        ))}
        {days.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="bg-background min-h-[80px]" />
          const key = `${year}-${month}-${day}`
          const dayTasks = tasksByDate[key] || []
          return (
            <div key={key} className={cn('bg-background min-h-[80px] p-1.5 border-t', isToday(day) && 'bg-primary/5')}>
              <span className={cn('text-xs font-medium', isToday(day) ? 'text-primary font-bold' : 'text-muted-foreground')}>{day}</span>
              {dayTasks.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {dayTasks.slice(0, 2).map(task => {
                    const config = typeConfig[task.eventType] || typeConfig.meeting
                    return (
                      <div key={task.id} className="flex items-center gap-1 text-[10px] truncate rounded px-1 py-0.5 bg-muted/50 hover:bg-muted cursor-pointer group" title={task.title}>
                        <span className={cn('size-1.5 rounded-full shrink-0', config.dotColor)} />
                        <span className="truncate">{task.title}</span>
                      </div>
                    )
                  })}
                  {dayTasks.length > 2 && (
                    <span className="text-[10px] text-muted-foreground pl-1">+{dayTasks.length - 2} ще</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TasksPage() {
  const { data, isLoading } = useTasks()
  const createMutation = useCreateTask()
  const deleteMutation = useDeleteTask()
  const [open, setOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [view, setView] = useState<'calendar' | 'list' | 'board'>('list')
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventType: 'interview' as 'interview' | 'call' | 'meeting',
    scheduledAt: '',
  })

  const filteredTasks = useMemo(() => {
    if (!data) return []
    return typeFilter === 'all' ? data : data.filter((t) => t.eventType === typeFilter)
  }, [data, typeFilter])

  const groupedTasks = useMemo(() => {
    if (!data) return {}
    const filtered = typeFilter === 'all' ? data : data.filter((t) => t.eventType === typeFilter)
    const sorted = [...filtered].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

    const groups: Record<string, typeof sorted> = {}
    sorted.forEach((task) => {
      const date = new Date(task.scheduledAt)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      let key: string
      if (date.toDateString() === today.toDateString()) {
        key = 'Сьогодні'
      } else if (date.toDateString() === tomorrow.toDateString()) {
        key = 'Завтра'
      } else {
        key = date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(task)
    })

    return groups
  }, [data, typeFilter])

  const boardTasks = useMemo(() => {
    if (!data) return { todo: [] as Task[], inProgress: [] as Task[], done: [] as Task[], overdue: [] as Task[] }
    const filtered = typeFilter === 'all' ? data : data.filter((t) => t.eventType === typeFilter)
    const now = new Date()
    return {
      todo: filtered.filter((t) => new Date(t.scheduledAt) > now),
      inProgress: [],
      done: [],
      overdue: filtered.filter((t) => new Date(t.scheduledAt) < now),
    }
  }, [data, typeFilter])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      title: form.title,
      description: form.description || undefined,
      eventType: form.eventType,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
    }, {
      onSuccess: () => {
        setOpen(false)
        setForm({ title: '', description: '', eventType: 'interview', scheduledAt: '' })
        toast.success('Завдання створено', { description: form.title })
      },
    })
  }

  const handleDelete = (id: string, title: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.info('Завдання видалено', { description: title }),
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
      </div>
    )
  }

  const totalTasks = data?.length ?? 0

  const TaskCard = ({ task }: { task: Task }) => {
    const config = typeConfig[task.eventType] || typeConfig.meeting
    return (
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', config.bg, config.color)}>
              {config.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Typography className="font-medium truncate">{task.title}</Typography>
                <Badge variant="outline" className="shrink-0 text-xs">{config.label}</Badge>
              </div>
              <Typography variant="bodySm" tone="muted" className="mt-0.5">
                {new Date(task.scheduledAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                {task.description && ` · ${task.description}`}
              </Typography>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id, task.title)} disabled={deleteMutation.isPending} className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2">Завдання</Typography>
          <Typography tone="muted" className="mt-1">Керування завданнями та зустрічами</Typography>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Нове завдання
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Нове завдання</DialogTitle>
              <DialogDescription>Створіть завдання або зустріч</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Назва *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Інтерв'ю — Іван Петренко" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Select value={form.eventType} onValueChange={(v) => setForm({ ...form, eventType: v as 'interview' | 'call' | 'meeting' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interview">Співбесіда</SelectItem>
                      <SelectItem value="call">Дзвінок</SelectItem>
                      <SelectItem value="meeting">Зустріч</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Дата та час *</Label>
                  <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Опис</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Деталі завдання..." rows={3} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Spinner className="size-4" /> : 'Створити'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Toggle + Filter */}
      <div className="flex items-center gap-4">
        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList>
            <TabsTrigger value="calendar">📅 Календар</TabsTrigger>
            <TabsTrigger value="list">📋 Список</TabsTrigger>
            <TabsTrigger value="board">📊 Дошка</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Тип завдання" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Усі</SelectItem>
            <SelectItem value="interview">Співбесіди</SelectItem>
            <SelectItem value="call">Дзвінки</SelectItem>
            <SelectItem value="meeting">Зустрічі</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as any)}>
        {/* Calendar View */}
        <TabsContent value="calendar">
          <CalendarView tasks={filteredTasks} />
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-6">
          {Object.keys(groupedTasks).length > 0 ? (
            Object.entries(groupedTasks).map(([date, tasks]) => (
              <div key={date} className="space-y-3">
                <Typography variant="h4" className="flex items-center gap-2 text-muted-foreground">
                  <div className="size-2 rounded-full bg-primary" />
                  {date}
                  <Badge variant="outline" className="ml-2 text-xs">{tasks.length}</Badge>
                </Typography>
                <div className="space-y-2">
                  {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
                </div>
              </div>
            ))
          ) : (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M8 6h10" /><path d="M6 12h12" /><path d="M4 18h16" />
                    <path d="m9 6 1 1" /><path d="m7 12 2 2" /><path d="m5 18 3 3" />
                  </svg>
                </div>
                <Typography variant="h4" className="mb-2">
                  {typeFilter !== 'all' ? 'Нічого не знайдено' : 'Немає завдань'}
                </Typography>
                <Typography tone="muted" className="max-w-sm">
                  {typeFilter !== 'all' ? 'Спробуйте змінити фільтр' : 'Створіть перше завдання або доручіть задачу AI-агенту'}
                </Typography>
                {typeFilter === 'all' && <Button className="mt-4" onClick={() => setOpen(true)}>Створити завдання</Button>}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Board View */}
        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { key: 'todo' as const, title: '📋 To Do', color: 'border-t-blue-500' },
              { key: 'inProgress' as const, title: '🔄 In Progress', color: 'border-t-amber-500' },
              { key: 'done' as const, title: '✅ Done', color: 'border-t-emerald-500' },
              { key: 'overdue' as const, title: '⏰ Overdue', color: 'border-t-red-500' },
            ].map(col => (
              <div key={col.key} className="flex flex-col min-h-[400px]">
                <div className={cn('flex items-center justify-between pb-3 border-b mb-3 px-1', col.color, 'border-t-2 pt-3')}>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.title}</span>
                  <Badge variant="outline" className="text-xs">{boardTasks[col.key].length}</Badge>
                </div>
                <div className="space-y-2 flex-1">
                  {boardTasks[col.key].length > 0 ? (
                    boardTasks[col.key].map((task) => {
                      const config = typeConfig[task.eventType] || typeConfig.meeting
                      return (
                        <Card key={task.id} className="cursor-pointer hover:shadow-sm transition-shadow">
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-center justify-between gap-1.5">
                              <Badge variant="outline" className="text-[10px]">{config.label}</Badge>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {new Date(task.scheduledAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <Typography variant="bodySm" className="font-medium leading-snug line-clamp-2">{task.title}</Typography>
                            <div className="flex justify-end pt-1" onClick={e => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => handleDelete(task.id, task.title)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 border border-dashed rounded-lg bg-muted/30">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">Порожньо</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Total count */}
      {totalTasks > 0 && (
        <div className="text-sm text-muted-foreground">
          Всього: {totalTasks} завдань
        </div>
      )}
    </div>
  )
}
