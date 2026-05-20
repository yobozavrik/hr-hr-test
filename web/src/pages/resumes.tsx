import { useState, useMemo } from 'react'
import { useResumes, useCreateResume, useDeleteResume } from '@/hooks/use-hr'
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
import { cn } from '@/lib/utils'

const statusLabels: Record<string, string> = {
  new: 'Нове',
  contact: 'Контакт',
  interview: 'Співбесіда',
  offer: 'Оффер',
  hired: 'Найнятий',
  rejected: 'Відмова',
}

const avatarGradients = [
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-purple-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-500',
  'from-rose-500 to-red-500',
]

export function ResumesPage() {
  const { data, isLoading } = useResumes()
  const createMutation = useCreateResume()
  const deleteMutation = useDeleteResume()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    salary: '',
    skills: '',
    experience: '',
    education: '',
  })

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((r: any) => {
      const matchesSearch = search === '' ||
        r.fullName.toLowerCase().includes(search.toLowerCase()) ||
        r.position.toLowerCase().includes(search.toLowerCase()) ||
        r.skills?.some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [data, search, statusFilter])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      fullName: form.fullName,
      email: form.email || undefined,
      phone: form.phone || undefined,
      position: form.position,
      salary: form.salary ? Number(form.salary) : undefined,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      experience: form.experience || undefined,
      education: form.education || undefined,
      currency: 'UAH',
      source: 'manual',
    }, {
      onSuccess: () => {
        setOpen(false)
        setForm({ fullName: '', email: '', phone: '', position: '', salary: '', skills: '', experience: '', education: '' })
        toast.success('Резюме додано', { description: form.fullName })
      },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2">Резюме</Typography>
          <Typography tone="muted" className="mt-1">Керування кандидатами</Typography>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Нове резюме
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Нове резюме</DialogTitle>
              <DialogDescription>Додайте інформацію про кандидата</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>ПІБ *</Label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Іван Петренко" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ivan@email.com" />
                </div>
                <div className="space-y-2">
                  <Label>Телефон</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+380 XX XXX XX XX" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Посада *</Label>
                  <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="React Developer" required />
                </div>
                <div className="space-y-2">
                  <Label>Очікувана ЗП</Label>
                  <Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="3500" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Навички (через кому)</Label>
                <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, TypeScript, Node.js" />
              </div>
              <div className="space-y-2">
                <Label>Досвід</Label>
                <Textarea value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="5 років у React..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Освіта</Label>
                <Textarea value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="КНУ, Computer Science" rows={2} />
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
            placeholder="Пошук по імені, посаді, навичкам..."
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
            <SelectItem value="new">Нове</SelectItem>
            <SelectItem value="contact">Контакт</SelectItem>
            <SelectItem value="interview">Співбесіда</SelectItem>
            <SelectItem value="offer">Оффер</SelectItem>
            <SelectItem value="hired">Найнятий</SelectItem>
            <SelectItem value="rejected">Відмова</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resume List */}
      <div className="space-y-3">
        {filteredData.length > 0 ? (
          filteredData.map((resume: any, idx: number) => (
            <Card key={resume.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={cn('flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white text-sm font-bold', avatarGradients[idx % avatarGradients.length])}>
                    {resume.fullName.split(' ').map((n: string) => n.charAt(0)).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg truncate">{resume.fullName}</CardTitle>
                      <Badge variant={resume.status === 'new' ? 'default' : 'secondary'}>
                        {statusLabels[resume.status] || resume.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      {resume.position}
                      {resume.salary && (
                        <>
                          <span>·</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {resume.salary.toLocaleString()} {resume.currency}
                          </span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Skills */}
                  {resume.skills && resume.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {resume.skills.slice(0, 6).map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                      {resume.skills.length > 6 && (
                        <Badge variant="outline" className="text-xs">+{resume.skills.length - 6}</Badge>
                      )}
                    </div>
                  )}
                  {/* Contact + Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {resume.email && (
                        <span className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                          {resume.email}
                        </span>
                      )}
                      {resume.phone && (
                        <span className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                          {resume.phone}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(resume.id, {
                        onSuccess: () => toast.info('Резюме видалено', { description: resume.fullName }),
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
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="M10 9H8" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                </svg>
              </div>
              <Typography variant="h4" className="mb-2">
                {search || statusFilter !== 'all' ? 'Нічого не знайдено' : 'Немає резюме'}
              </Typography>
              <Typography tone="muted" className="max-w-sm">
                {search || statusFilter !== 'all'
                  ? 'Спробуйте змінити фільтри або пошуковий запит'
                  : 'Додайте перше резюме або імпортуйте з job boards'}
              </Typography>
              {!search && statusFilter === 'all' && (
                <Button className="mt-4" onClick={() => setOpen(true)}>
                  Додати резюме
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Results count */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Показано {filteredData.length} з {data?.length ?? 0} резюме</span>
        </div>
      )}
    </div>
  )
}
