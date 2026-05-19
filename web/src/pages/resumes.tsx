import { useState } from 'react'
import { useResumes, useCreateResume, useDeleteResume } from '@/hooks/use-hr'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

const statusLabels: Record<string, string> = {
  new: 'Нове',
  contact: 'Контакт',
  interview: 'Співбесіда',
  offer: 'Оффер',
  hired: 'Найнятий',
  rejected: 'Відмова',
}

export function ResumesPage() {
  const { data, isLoading } = useResumes()
  const createMutation = useCreateResume()
  const deleteMutation = useDeleteResume()
  const [open, setOpen] = useState(false)
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
          <Typography variant="h2">Резюме</Typography>
          <Typography tone="muted">Керування кандидатами</Typography>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Нове резюме</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Нове резюме</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label>ПІБ</Label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Телефон</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Посада</Label>
                <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label>Очікувана ЗП</Label>
                <Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Навички (через кому)</Label>
                <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, TypeScript, Node.js" />
              </div>
              <div className="grid gap-2">
                <Label>Досвід</Label>
                <Textarea value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Освіта</Label>
                <Textarea value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Spinner className="size-4" /> : 'Створити'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {data?.map((resume: any) => (
          <Card key={resume.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{resume.fullName}</CardTitle>
                  <Typography tone="muted" className="mt-1">
                    {resume.position} {resume.salary && `· ${resume.salary.toLocaleString()} ${resume.currency}`}
                  </Typography>
                </div>
                <Badge variant={resume.status === 'new' ? 'default' : 'secondary'}>
                  {statusLabels[resume.status] || resume.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {resume.skills?.map((skill: string) => (
                  <Badge key={skill} variant="outline">{skill}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {resume.email && (
                  <Typography variant="bodySm" tone="muted">{resume.email}</Typography>
                )}
                {resume.phone && (
                  <Typography variant="bodySm" tone="muted">{resume.phone}</Typography>
                )}
                <div className="ml-auto flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(resume.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Видалити
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!data || data.length === 0) && (
          <Card className="p-8 text-center">
            <Typography tone="muted">Немає резюме. Додайте перше!</Typography>
          </Card>
        )}
      </div>
    </div>
  )
}
