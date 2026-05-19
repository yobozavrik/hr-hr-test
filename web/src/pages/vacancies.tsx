import { useState } from 'react'
import { useVacancies, useCreateVacancy, useDeleteVacancy } from '@/hooks/use-hr'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export function VacanciesPage() {
  const { data, isLoading } = useVacancies()
  const createMutation = useCreateVacancy()
  const deleteMutation = useDeleteVacancy()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    salaryFrom: '',
    salaryTo: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      title: form.title,
      company: form.company,
      location: form.location || undefined,
      salaryFrom: form.salaryFrom ? Number(form.salaryFrom) : undefined,
      salaryTo: form.salaryTo ? Number(form.salaryTo) : undefined,
      description: form.description,
      currency: 'RUB',
      source: 'manual',
    }, {
      onSuccess: () => {
        setOpen(false)
        setForm({ title: '', company: '', location: '', salaryFrom: '', salaryTo: '', description: '' })
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

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2">Вакансии</Typography>
          <Typography tone="muted">Управление вакансиями</Typography>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Новая вакансия</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Новая вакансия</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label>Название позиции</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label>Компания</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label>Локация</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>ЗП от</Label>
                  <Input type="number" value={form.salaryFrom} onChange={(e) => setForm({ ...form, salaryFrom: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>ЗП до</Label>
                  <Input type="number" value={form.salaryTo} onChange={(e) => setForm({ ...form, salaryTo: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Описание</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Spinner className="size-4" /> : 'Создать'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {data?.map((vacancy: any) => (
          <Card key={vacancy.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{vacancy.title}</CardTitle>
                  <Typography tone="muted" className="mt-1">
                    {vacancy.company} {vacancy.location && `· ${vacancy.location}`}
                  </Typography>
                </div>
                <Badge variant={vacancy.status === 'active' ? 'default' : 'secondary'}>
                  {vacancy.status === 'active' ? 'Активна' : 'Закрыта'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {(vacancy.salaryFrom || vacancy.salaryTo) && (
                  <Typography variant="bodySm" className="font-medium">
                    {vacancy.salaryFrom?.toLocaleString()} - {vacancy.salaryTo?.toLocaleString()} {vacancy.currency}
                  </Typography>
                )}
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => alert(`Vacancy ID: ${vacancy.id}`)}>
                    Подробнее
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(vacancy.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!data || data.length === 0) && (
          <Card className="p-8 text-center">
            <Typography tone="muted">Нет вакансий. Создайте первую!</Typography>
          </Card>
        )}
      </div>
    </div>
  )
}
