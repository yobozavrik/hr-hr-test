import { useState, useMemo } from 'react'
import { useVacancies, useCreateVacancy, useDeleteVacancy } from '@/hooks/use-hr'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export function VacanciesPage() {
  const { data, isLoading } = useVacancies()
  const createMutation = useCreateVacancy()
  const deleteMutation = useDeleteVacancy()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    salaryFrom: '',
    salaryTo: '',
    description: '',
    currency: 'UAH',
  })

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((v: any) => {
      const matchesSearch = search === '' ||
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.company.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [data, search, statusFilter])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      title: form.title,
      company: form.company,
      location: form.location || undefined,
      salaryFrom: form.salaryFrom ? Number(form.salaryFrom) : undefined,
      salaryTo: form.salaryTo ? Number(form.salaryTo) : undefined,
      description: form.description,
      currency: form.currency,
      source: 'manual',
    }, {
      onSuccess: () => {
        setOpen(false)
        setForm({ title: '', company: '', location: '', salaryFrom: '', salaryTo: '', description: '', currency: 'UAH' })
        toast.success('Вакансію створено', { description: form.title })
      },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2">Вакансії</Typography>
          <Typography tone="muted" className="mt-1">Керування вакансіями</Typography>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Нова вакансія
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Нова вакансія</DialogTitle>
              <DialogDescription>Заповніть інформацію про вакансію</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Назва позиції *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Senior React Developer" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Компанія *</Label>
                  <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="TechCorp" required />
                </div>
                <div className="space-y-2">
                  <Label>Локація</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Київ, Remote" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>ЗП від</Label>
                  <Input type="number" value={form.salaryFrom} onChange={(e) => setForm({ ...form, salaryFrom: e.target.value })} placeholder="3000" />
                </div>
                <div className="space-y-2">
                  <Label>ЗП до</Label>
                  <Input type="number" value={form.salaryTo} onChange={(e) => setForm({ ...form, salaryTo: e.target.value })} placeholder="5000" />
                </div>
                <div className="space-y-2">
                  <Label>Валюта</Label>
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UAH">UAH</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Опис *</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Вимоги, умови, переваги..." rows={4} required />
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

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Пошук вакансій..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Усі</SelectItem>
            <SelectItem value="active">Активні</SelectItem>
            <SelectItem value="closed">Закриті</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vacancy List */}
      <div className="space-y-3">
        {filteredData.length > 0 ? (
          filteredData.map((vacancy: any) => (
            <Card key={vacancy.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{vacancy.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      {vacancy.company}
                      {vacancy.location && (
                        <>
                          <span>·</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          {vacancy.location}
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={vacancy.status === 'active' ? 'default' : 'secondary'}>
                    {vacancy.status === 'active' ? 'Активна' : 'Закрита'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {(vacancy.salaryFrom || vacancy.salaryTo) && (
                      <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        {vacancy.salaryFrom?.toLocaleString()} — {vacancy.salaryTo?.toLocaleString()} {vacancy.currency}
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs">{vacancy.source || 'manual'}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(vacancy.id, {
                        onSuccess: () => toast.info('Вакансію видалено', { description: vacancy.title }),
                      })}
                      disabled={deleteMutation.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      Видалити
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <Typography variant="h4" className="mb-2">
                {search || statusFilter !== 'all' ? 'Нічого не знайдено' : 'Немає вакансій'}
              </Typography>
              <Typography tone="muted" className="max-w-sm">
                {search || statusFilter !== 'all'
                  ? 'Спробуйте змінити фільтри або пошуковий запит'
                  : 'Створіть першу вакансію або імпортуйте з job boards'}
              </Typography>
              {!search && statusFilter === 'all' && (
                <Button className="mt-4" onClick={() => setOpen(true)}>
                  Створити вакансію
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Results count */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Показано {filteredData.length} з {data?.length ?? 0} вакансій</span>
        </div>
      )}
    </div>
  )
}
