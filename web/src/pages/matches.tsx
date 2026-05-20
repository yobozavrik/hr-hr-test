import { useState, useMemo } from 'react'
import { useMatches, useVacancies, useResumes, useCreateMatch, useUpdateMatch } from '@/hooks/use-hr'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function MatchesPage() {
  const { data: matches, isLoading } = useMatches()
  const { data: vacancies } = useVacancies()
  const { data: resumes } = useResumes()
  const createMutation = useCreateMatch()
  const updateMutation = useUpdateMatch()
  const [selectedVacancy, setSelectedVacancy] = useState('')
  const [selectedResume, setSelectedResume] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredMatches = useMemo(() => {
    if (!matches) return []
    return matches.filter((m: any) => {
      const matchesSearch = search === '' ||
        m.vacancy?.title?.toLowerCase().includes(search.toLowerCase()) ||
        m.resume?.fullName?.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [matches, search, statusFilter])

  const handleCreate = () => {
    if (!selectedVacancy || !selectedResume) return
    createMutation.mutate({ vacancyId: selectedVacancy, resumeId: selectedResume }, {
      onSuccess: () => toast.success('Матч створено'),
    })
    setSelectedVacancy('')
    setSelectedResume('')
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Typography variant="h2">Матчі</Typography>
        <Typography tone="muted" className="mt-1">Зіставлення вакансій та резюме</Typography>
      </div>

      {/* Create Match */}
      <Card>
        <CardHeader>
          <CardTitle>Створити матч</CardTitle>
          <CardDescription>Оберіть вакансію та резюме для зіставлення</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Select value={selectedVacancy} onValueChange={setSelectedVacancy}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Оберіть вакансію" />
              </SelectTrigger>
              <SelectContent>
                {vacancies?.map((v: any) => (
                  <SelectItem key={v.id} value={v.id}>{v.title} — {v.company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedResume} onValueChange={setSelectedResume}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Оберіть резюме" />
              </SelectTrigger>
              <SelectContent>
                {resumes?.map((r: any) => (
                  <SelectItem key={r.id} value={r.id}>{r.fullName} — {r.position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCreate} disabled={!selectedVacancy || !selectedResume || createMutation.isPending}>
              {createMutation.isPending ? <Spinner className="size-4" /> : 'Створити'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Пошук матчів..."
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
            <SelectItem value="pending">На розгляді</SelectItem>
            <SelectItem value="approved">Схвалено</SelectItem>
            <SelectItem value="rejected">Відхилено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Matches List */}
      <div className="space-y-3">
        {filteredMatches.length > 0 ? (
          filteredMatches
            .sort((a: any, b: any) => b.score - a.score)
            .map((match: any) => (
              <Card key={match.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Score Circle */}
                    <div className={cn(
                      'flex size-14 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                      match.score >= 70 ? 'bg-emerald-500' : match.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                    )}>
                      {match.score}%
                    </div>

                    {/* Match Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Typography className="font-medium truncate">{match.resume?.fullName}</Typography>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        <Typography className="font-medium truncate">{match.vacancy?.title}</Typography>
                      </div>
                      <Typography variant="bodySm" tone="muted" className="mt-0.5">
                        {match.resume?.position} · {match.vacancy?.company}
                      </Typography>
                    </div>

                    {/* Status + Actions */}
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge variant={
                        match.status === 'approved' ? 'default' :
                        match.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }>
                        {match.status === 'pending' ? 'На розгляді' : match.status === 'approved' ? 'Схвалено' : 'Відхилено'}
                      </Badge>
                      {match.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateMutation.mutate({ id: match.id, status: 'approved' }, {
                              onSuccess: () => toast.success('Матч затверджено'),
                            })}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M20 6 9 17l-5-5"/></svg>
                            Схвалити
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateMutation.mutate({ id: match.id, status: 'rejected' }, {
                              onSuccess: () => toast.info('Матч відхилено'),
                            })}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            Відхилити
                          </Button>
                        </div>
                      )}
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
                  <circle cx="18" cy="18" r="3" />
                  <circle cx="6" cy="6" r="3" />
                  <path d="M6 21V9a9 9 0 0 0 9 9" />
                </svg>
              </div>
              <Typography variant="h4" className="mb-2">
                {search || statusFilter !== 'all' ? 'Нічого не знайдено' : 'Немає матчів'}
              </Typography>
              <Typography tone="muted" className="max-w-sm">
                {search || statusFilter !== 'all'
                  ? 'Спробуйте змінити фільтри або пошуковий запит'
                  : 'Створіть перший матч, обравши вакансію та резюме'}
              </Typography>
            </div>
          </Card>
        )}
      </div>

      {/* Results count */}
      {filteredMatches.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Показано {filteredMatches.length} з {matches?.length ?? 0} матчів
        </div>
      )}
    </div>
  )
}
