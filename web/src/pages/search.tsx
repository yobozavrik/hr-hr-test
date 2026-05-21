import { useState } from 'react'
import {
  useJobBoardSearch,
  useSaveVacancy,
  useSaveResume,
  useAnalyzeMatch
} from '@/hooks/use-search'
import { useVacancies, useResumes } from '@/hooks/use-hr'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'

interface SearchResultItem {
  id: string
  title: string
  company?: string
  candidateName?: string
  location?: string
  salaryFrom?: number
  salaryTo?: number
  currency?: string
  description?: string
  source: string
  url?: string
  skills?: string[]
}

interface MatchAnalysisResult {
  score: number
  verdict: string
  summary: string
  pros: string[]
  cons: string[]
  recommendations?: string[]
}

const SourceLogo = ({ source, className = "size-5" }: { source: string; className?: string }) => {
  switch (source) {
    case 'work.ua':
      return (
        <span className={`inline-flex items-center justify-center font-bold bg-red-600 text-white rounded text-[10px] uppercase tracking-wider px-1 py-0.5 ${className}`}>
          W.ua
        </span>
      )
    case 'robota.ua':
      return (
        <span className={`inline-flex items-center justify-center font-bold bg-blue-700 text-white rounded text-[10px] uppercase tracking-wider px-1 py-0.5 ${className}`}>
          R.ua
        </span>
      )
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" className={`fill-blue-700 ${className}`} xmlns="http://www.w3.org/2000/svg">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      )
    default:
      return null
  }
}

export function SearchPage() {
  const [searchText, setSearchText] = useState('')
  const [searchType, setSearchType] = useState<'vacancy' | 'resume'>('vacancy')
  const [selectedSource, setSelectedSource] = useState<'all' | 'work.ua' | 'robota.ua' | 'linkedin'>('all')
  const [location, setLocation] = useState('')
  const [page, setPage] = useState(0)

  const [activeAnalysisCardId, setActiveAnalysisCardId] = useState<string | null>(null)
  const [selectedMatchEntityId, setSelectedMatchEntityId] = useState<string>('')
  const [matchAnalysisResult, setMatchAnalysisResult] = useState<MatchAnalysisResult | null>(null)

  const { data: results, isLoading, error } = useJobBoardSearch({
    text: searchText || ' ',
    type: searchType,
    source: selectedSource,
    page,
    location: location || undefined
  })

  const { data: savedVacancies } = useVacancies()
  const { data: savedResumes } = useResumes()

  const saveVacancyMutation = useSaveVacancy()
  const saveResumeMutation = useSaveResume()
  const analyzeMatchMutation = useAnalyzeMatch()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    setMatchAnalysisResult(null)
    setActiveAnalysisCardId(null)
  }

  const handleSaveItem = (item: SearchResultItem) => {
    if (searchType === 'vacancy') {
      saveVacancyMutation.mutate({
        title: item.title,
        company: item.company || 'Невідома компанія',
        location: item.location,
        salaryFrom: item.salaryFrom,
        salaryTo: item.salaryTo,
        currency: item.currency || 'UAH',
        description: item.description || '',
        source: item.source,
        sourceUrl: item.url,
      })
    } else {
      saveResumeMutation.mutate({
        fullName: item.candidateName || 'Шукач',
        position: item.title,
        location: item.location,
        salary: item.salaryFrom,
        currency: item.currency || 'UAH',
        skills: item.skills || [],
        experience: item.description || '',
        source: item.source,
        sourceUrl: item.url,
      })
    }
  }

  const handleStartAnalysis = (item: SearchResultItem) => {
    setActiveAnalysisCardId(item.id)
    setMatchAnalysisResult(null)
    setSelectedMatchEntityId('')
  }

  const executeAIAnalysis = (item: SearchResultItem) => {
    if (!selectedMatchEntityId) return

    let vacancyData: { title: string; description: string }
    let resumeData: { name: string; position: string; skills: string[]; experience?: string; education?: string }

    if (searchType === 'vacancy') {
      const dbResume = savedResumes?.find((r) => r.id === selectedMatchEntityId)
      if (!dbResume) return
      vacancyData = { title: item.title, description: item.description || '' }
      resumeData = { name: dbResume.fullName, position: dbResume.position, skills: dbResume.skills, experience: dbResume.experience || '', education: dbResume.education || '' }
    } else {
      const dbVacancy = savedVacancies?.find((v) => v.id === selectedMatchEntityId)
      if (!dbVacancy) return
      vacancyData = { title: dbVacancy.title, description: dbVacancy.description || '' }
      resumeData = { name: item.candidateName || 'Шукач', position: item.title, skills: item.skills || [], experience: item.description || '', education: '' }
    }

    analyzeMatchMutation.mutate({ vacancy: vacancyData, resume: resumeData }, {
      onSuccess: (data) => { setMatchAnalysisResult(data) }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <Typography variant="h2">Розумний Пошук</Typography>
          <Typography tone="muted" className="mt-1">Мультиплатформний пошук вакансій та резюме з підтримкою миттєвої AI-оцінки</Typography>
        </div>
        <div className="bg-muted p-1 rounded-lg inline-flex gap-1 self-start md:self-auto">
          <Button
            variant={searchType === 'vacancy' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setSearchType('vacancy'); setPage(0); setMatchAnalysisResult(null); setActiveAnalysisCardId(null) }}
          >
            Вакансії
          </Button>
          <Button
            variant={searchType === 'resume' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setSearchType('resume'); setPage(0); setMatchAnalysisResult(null); setActiveAnalysisCardId(null) }}
          >
            Резюме
          </Button>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Ключові слова, стек або посада</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={searchType === 'vacancy' ? "Наприклад: React розробник, Node.js, UI/UX" : "Наприклад: Python інженер, QA Automation"}
                    className="pr-10 h-11"
                  />
                  <div className="absolute right-3 top-3.5 opacity-40">
                    <svg viewBox="0 0 24 24" className="size-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.71 20.29l-3.68-3.68A8.963 8.963 0 0020 11c0-4.96-4.04-9-9-9s-9 4.04-9 9 4.04 9 9 9c2.12 0 4.07-.74 5.61-1.97l3.68 3.68c.2.2.45.29.71.29s.51-.1.71-.29c.39-.39.39-1.03 0-1.42zM4 11c0-3.86 3.14-7 7-7s7 3.14 7 7-3.14 7-7 7-7-3.14-7-7z" />
                    </svg>
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} size="lg" className="h-11 px-8">
                  {isLoading ? <Spinner className="size-4 mr-2" /> : 'Знайти'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Платформа</Label>
                <Select value={selectedSource} onValueChange={(val) => setSelectedSource(val as typeof selectedSource)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Всі платформи" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всі платформи</SelectItem>
                    <SelectItem value="work.ua">Work.ua (Україна)</SelectItem>
                    <SelectItem value="robota.ua">Robota.ua (Україна)</SelectItem>
                    <SelectItem value="linkedin">LinkedIn (Global)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Локація / Регіон</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Наприклад: Київ, Віддалено" />
              </div>
              <div className="flex items-end">
                <Typography variant="bodySm" tone="muted" className="sm:text-right sm:mt-0 mt-2">
                  Використовуйте ключові слова для звуження пошуку
                </Typography>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10 p-6">
          <Typography className="text-destructive font-semibold">Виникла помилка під час пошуку</Typography>
          <Typography tone="muted" variant="bodySm" className="text-destructive/80 mt-1">{error.message}</Typography>
        </Card>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
            <Typography variant="h4">Результати ({results.length})</Typography>
            {results.length > 0 && (
              <div className="flex gap-2 items-center">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Назад</Button>
                <Typography variant="bodySm" className="font-medium px-2">Сторінка {page + 1}</Typography>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={results.length < 20}>Вперед</Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {results.map((item: SearchResultItem) => {
              const isAnalyzing = activeAnalysisCardId === item.id
              const isSaved = searchType === 'vacancy'
                ? saveVacancyMutation.isSuccess && saveVacancyMutation.variables?.sourceUrl === item.url
                : saveResumeMutation.isSuccess && saveResumeMutation.variables?.sourceUrl === item.url

              return (
                <Card key={item.id} className="relative overflow-hidden">
                  {/* Source color strip */}
                  <div className={`absolute top-0 left-0 right-0 h-[3px] ${
                    item.source === 'work.ua' ? 'bg-red-600' :
                    item.source === 'robota.ua' ? 'bg-blue-700' :
                    item.source === 'linkedin' ? 'bg-blue-700' : 'bg-red-600'
                  }`} />

                  <CardHeader className="pb-3 pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <SourceLogo source={item.source} />
                          <Badge variant="outline" className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5">
                            {item.source}
                          </Badge>
                          {item.location && (
                            <Typography variant="bodySm" tone="muted" className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                              {item.location}
                            </Typography>
                          )}
                        </div>
                        <CardTitle className="text-xl font-bold mt-2">
                          {searchType === 'vacancy' ? item.title : item.candidateName || 'Шукач'}
                        </CardTitle>
                        <Typography tone="muted" className="font-semibold text-sm mt-1">
                          {searchType === 'vacancy' ? item.company : item.title}
                        </Typography>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {item.salaryFrom ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-bold text-sm">
                            {item.salaryFrom.toLocaleString()}{item.salaryTo && item.salaryTo !== item.salaryFrom ? ` - ${item.salaryTo.toLocaleString()}` : ''} {item.currency || 'UAH'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="px-3 py-1 text-xs">ЗП не вказана</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 p-3.5 rounded-lg border">
                      <Typography variant="bodySm" tone="muted" className="line-clamp-3 leading-relaxed">
                        {item.description}
                      </Typography>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveItem(item)} disabled={saveVacancyMutation.isPending || saveResumeMutation.isPending || isSaved}>
                          {saveVacancyMutation.isPending || saveResumeMutation.isPending ? (
                            <Spinner className="size-4 mr-2" />
                          ) : isSaved ? 'Збережено' : 'Зберегти в базу'}
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={item.url} target="_blank" rel="noopener noreferrer">Відкрити оригінал</a>
                        </Button>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => handleStartAnalysis(item)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" /><path d="M12 18v4" /><path d="m4.9 19.1 2.9-2.9" /><path d="M2 12h4" /><path d="m4.9 4.9 2.9 2.9" /></svg>
                        AI Аналіз
                      </Button>
                    </div>

                    {/* AI Analysis Panel */}
                    {isAnalyzing && (
                      <div className="mt-4 p-4 rounded-lg border bg-muted/30 space-y-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="grid gap-1">
                            <Typography variant="bodySm" className="font-semibold">
                              {searchType === 'vacancy' ? 'З ким із бази порівняти цю вакансію?' : 'Для якої вакансії з бази зробити оцінку?'}
                            </Typography>
                            <div className="flex items-center gap-2 mt-1">
                              <Select value={selectedMatchEntityId} onValueChange={setSelectedMatchEntityId}>
                                <SelectTrigger className="w-[280px]">
                                  <SelectValue placeholder={searchType === 'vacancy' ? 'Оберіть резюме з бази...' : 'Оберіть вакансію з бази...'} />
                                </SelectTrigger>
                                <SelectContent>
                                  {searchType === 'vacancy'
                                    ? savedResumes?.map((res) => (
                                        <SelectItem key={res.id} value={res.id}>{res.fullName} ({res.position})</SelectItem>
                                      ))
                                    : savedVacancies?.map((vac) => (
                                        <SelectItem key={vac.id} value={vac.id}>{vac.title} - {vac.company}</SelectItem>
                                      ))
                                  }
                                  {((searchType === 'vacancy' && !savedResumes?.length) || (searchType === 'resume' && !savedVacancies?.length)) && (
                                    <SelectItem value="none" disabled>База даних порожня</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <Button size="sm" disabled={!selectedMatchEntityId || analyzeMatchMutation.isPending} onClick={() => executeAIAnalysis(item)}>
                                {analyzeMatchMutation.isPending ? <Spinner className="size-4" /> : 'Запустити AI-Аналіз'}
                              </Button>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => { setActiveAnalysisCardId(null); setMatchAnalysisResult(null) }}>Закрити</Button>
                        </div>

                        {analyzeMatchMutation.isPending && (
                          <div className="flex flex-col items-center justify-center py-8 gap-3 border border-dashed rounded-lg">
                            <Spinner className="size-8" />
                            <Typography variant="bodySm" tone="muted">AI-Агент аналізує стек технологій, досвід та зарплату...</Typography>
                          </div>
                        )}

                        {matchAnalysisResult && (
                          <div className="rounded-lg p-5 bg-background space-y-4 border">
                            <div className="flex items-center gap-4">
                              <div className="relative size-16 flex items-center justify-center">
                                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                  <path className="text-muted/20" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                  <path className={`${
                                    matchAnalysisResult.score >= 75 ? 'text-emerald-500' :
                                    matchAnalysisResult.score >= 50 ? 'text-amber-500' : 'text-red-500'
                                  }`} strokeDasharray={`${matchAnalysisResult.score}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <span className="absolute font-extrabold text-base">{matchAnalysisResult.score}%</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <Typography variant="h4" className="text-lg font-bold">Відповідність кандидата</Typography>
                                  <Badge className={
                                    matchAnalysisResult.verdict === 'strong_match' ? 'bg-emerald-500 text-white' :
                                    matchAnalysisResult.verdict === 'potential_match' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                                  }>
                                    {matchAnalysisResult.verdict === 'strong_match' ? 'Рекомендований' :
                                     matchAnalysisResult.verdict === 'potential_match' ? 'Є ризики' : 'Не підходить'}
                                  </Badge>
                                </div>
                                <Typography variant="bodySm" tone="muted" className="mt-0.5">Аналіз виконано AI-рекрутером на льоту</Typography>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-1">
                              <Typography variant="bodySm" className="font-bold">Резюме оцінки</Typography>
                              <Typography variant="bodySm" tone="muted" className="leading-relaxed">{matchAnalysisResult.summary}</Typography>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900">
                                <Typography variant="bodySm" className="font-bold text-emerald-700 dark:text-emerald-400">✓ Переваги</Typography>
                                <ul className="list-disc pl-4 space-y-1">
                                  {matchAnalysisResult.pros.map((pro: string, idx: number) => (
                                    <li key={idx}><Typography variant="bodySm" tone="muted">{pro}</Typography></li>
                                  ))}
                                </ul>
                              </div>
                              <div className="space-y-2 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-900">
                                <Typography variant="bodySm" className="font-bold text-red-700 dark:text-red-400">⚠ Недоліки / Ризики</Typography>
                                <ul className="list-disc pl-4 space-y-1">
                                  {matchAnalysisResult.cons.map((con: string, idx: number) => (
                                    <li key={idx}><Typography variant="bodySm" tone="muted">{con}</Typography></li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {matchAnalysisResult.recommendations && matchAnalysisResult.recommendations.length > 0 && (
                              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-2">
                                <Typography variant="bodySm" className="font-bold text-primary">Запитання для інтерв'ю / Рекомендації</Typography>
                                <ul className="list-decimal pl-4 space-y-1.5">
                                  {matchAnalysisResult.recommendations.map((rec: string, idx: number) => (
                                    <li key={idx}><Typography variant="bodySm" tone="muted">{rec}</Typography></li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {results.length === 0 && (
            <Card className="p-12 text-center border-dashed">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <Typography variant="h4" className="mb-2">Нічого не знайдено</Typography>
                <Typography tone="muted" className="max-w-sm">Спробуйте змінити ключові слова або скинути фільтри.</Typography>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
