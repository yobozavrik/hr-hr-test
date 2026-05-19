import { useState } from 'react'
import { useTasks, useCreateTask, useDeleteTask } from '@/hooks/use-hr'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function TasksPage() {
  const { data, isLoading } = useTasks()
  const createMutation = useCreateTask()
  const deleteMutation = useDeleteTask()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventType: 'interview' as 'interview' | 'call' | 'meeting',
    scheduledAt: '',
  })

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
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    )
  }

  const typeLabels: Record<string, string> = {
    interview: 'Собеседование',
    call: 'Звонок',
    meeting: 'Встреча',
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2">Задачи</Typography>
          <Typography tone="muted">Управление задачами и встречами</Typography>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Новая задача</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Новая задача</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label>Название</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label>Тип</Label>
                <Select value={form.eventType} onValueChange={(v) => setForm({ ...form, eventType: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interview">Собеседование</SelectItem>
                    <SelectItem value="call">Звонок</SelectItem>
                    <SelectItem value="meeting">Встреча</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Дата и время</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Описание</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Spinner className="size-4" /> : 'Создать'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {data?.map((task: any) => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Typography className="font-medium">{task.title}</Typography>
                    <Badge variant={task.eventType === 'interview' ? 'default' : 'secondary'}>
                      {typeLabels[task.eventType]}
                    </Badge>
                  </div>
                  <Typography variant="bodySm" tone="muted" className="mt-1">
                    {new Date(task.scheduledAt).toLocaleString('ru-RU')}
                  </Typography>
                  {task.description && (
                    <Typography variant="bodySm" className="mt-2">{task.description}</Typography>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(task.id)}
                  disabled={deleteMutation.isPending}
                >
                  Удалить
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!data || data.length === 0) && (
          <Card className="p-8 text-center">
            <Typography tone="muted">Нет задач. Создайте первую!</Typography>
          </Card>
        )}
      </div>
    </div>
  )
}
