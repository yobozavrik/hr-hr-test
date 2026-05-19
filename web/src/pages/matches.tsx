import { useState } from 'react'
import { useMatches, useVacancies, useResumes, useCreateMatch, useUpdateMatch } from '@/hooks/use-hr'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function MatchesPage() {
  const { data: matches, isLoading } = useMatches()
  const { data: vacancies } = useVacancies()
  const { data: resumes } = useResumes()
  const createMutation = useCreateMatch()
  const updateMutation = useUpdateMatch()
  const [selectedVacancy, setSelectedVacancy] = useState('')
  const [selectedResume, setSelectedResume] = useState('')

  const handleCreate = () => {
    if (!selectedVacancy || !selectedResume) return
    createMutation.mutate({ vacancyId: selectedVacancy, resumeId: selectedResume })
    setSelectedVacancy('')
    setSelectedResume('')
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
      <div>
        <Typography variant="h2">Матчи</Typography>
        <Typography tone="muted">Сопоставление вакансий и резюме</Typography>
      </div>

      {/* Create Match */}
      <Card>
        <CardHeader>
          <CardTitle>Создать матч</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Select value={selectedVacancy} onValueChange={setSelectedVacancy}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите вакансию" />
              </SelectTrigger>
              <SelectContent>
                {vacancies?.map((v: any) => (
                  <SelectItem key={v.id} value={v.id}>{v.title} ({v.company})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedResume} onValueChange={setSelectedResume}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите резюме" />
              </SelectTrigger>
              <SelectContent>
                {resumes?.map((r: any) => (
                  <SelectItem key={r.id} value={r.id}>{r.fullName} — {r.position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate} disabled={!selectedVacancy || !selectedResume || createMutation.isPending}>
            {createMutation.isPending ? <Spinner className="size-4" /> : 'Создать матч'}
          </Button>
        </CardContent>
      </Card>

      {/* Matches List */}
      <div className="grid gap-4">
        {matches?.map((match: any) => (
          <Card key={match.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <Typography className="font-medium">{match.vacancy?.title}</Typography>
                    <span className="text-muted-foreground">→</span>
                    <Typography className="font-medium">{match.resume?.fullName}</Typography>
                  </div>
                  <Typography variant="bodySm" tone="muted">
                    {match.vacancy?.company} · {match.resume?.position}
                  </Typography>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <Badge variant={match.score >= 70 ? 'default' : match.score >= 40 ? 'secondary' : 'outline'}>
                      {match.score}%
                    </Badge>
                    <Typography variant="bodySm" tone="muted" className="mt-1">
                      {match.status === 'pending' ? 'На рассмотрении' : match.status === 'approved' ? 'Одобрен' : 'Отклонен'}
                    </Typography>
                  </div>
                  {match.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => updateMutation.mutate({ id: match.id, status: 'approved' })}
                      >
                        Одобрить
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateMutation.mutate({ id: match.id, status: 'rejected' })}
                      >
                        Отклонить
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!matches || matches.length === 0) && (
          <Card className="p-8 text-center">
            <Typography tone="muted">Нет матчей. Создайте первый!</Typography>
          </Card>
        )}
      </div>
    </div>
  )
}
