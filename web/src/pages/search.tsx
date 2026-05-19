import { useState } from 'react'
import {
  useJobBoardSearch,
  useSaveVacancy,
  useSaveResume,
  useAnalyzeMatch
} from '@/hooks/use-hh'
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

// Beautiful SVG Icons for each job board to elevate premium aesthetics
const SourceLogo = ({ source, className = "size-5" }: { source: string; className?: string }) => {
  switch (source) {
    case 'work.ua':
      return (
        <span className={`inline-flex items-center justify-center font-bold bg-[#e62e2d] text-white rounded text-[10px] uppercase tracking-wider px-1 py-0.5 ${className}`}>
          W.ua
        </span>
      )
    case 'robota.ua':
      return (
        <span className={`inline-flex items-center justify-center font-bold bg-[#0056cc] text-white rounded text-[10px] uppercase tracking-wider px-1 py-0.5 ${className}`}>
          R.ua
        </span>
      )
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" className={`fill-[#0a66c2] ${className}`} xmlns="http://www.w3.org/2000/svg">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    case 'hh.ru':
    default:
      return (
        <span className={`inline-flex items-center justify-center font-bold bg-[#e41b13] text-white rounded-full text-[10px] size-5 ${className}`}>
          hh
        </span>
      )
  }
}

export function SearchPage() {
  const [searchText, setSearchText] = useState('')
  const [searchType, setSearchType] = useState<'vacancy' | 'resume'>('vacancy')
  const [selectedSource, setSelectedSource] = useState<'all' | 'hh.ru' | 'work.ua' | 'robota.ua' | 'linkedin'>('all')
  const [location, setLocation] = useState('')
  const [page, setPage] = useState(0)

  // State for on-the-fly AI matching analysis
  const [activeAnalysisCardId, setActiveAnalysisCardId] = useState<string | null>(null)
  const [selectedMatchEntityId, setSelectedMatchEntityId] = useState<string>('')
  const [matchAnalysisResult, setMatchAnalysisResult] = useState<any>(null)

  // Fetch unified search results
  const { data: results, isLoading, error } = useJobBoardSearch({
    text: searchText || ' ',
    type: searchType,
    source: selectedSource,
    page,
    location: location || undefined
  })

  // Fetch db entities for on-the-fly cross-matching
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

  // Handle saving search items (either vacancy or resume) to PostgreSQL
  const handleSaveItem = (item: any) => {
    if (searchType === 'vacancy') {
      saveVacancyMutation.mutate({
        title: item.title,
        company: item.company || 'Неизвестная компания',
        location: item.location,
        salaryFrom: item.salaryFrom,
        salaryTo: item.salaryTo,
        currency: item.currency || 'UAH',
        description: item.description,
        source: item.source,
        sourceUrl: item.url,
      })
    } else {
      saveResumeMutation.mutate({
        fullName: item.candidateName || 'Соискатель',
        position: item.title,
        location: item.location,
        salary: item.salaryFrom,
        currency: item.currency || 'UAH',
        skills: item.skills || [],
        experience: item.description,
        source: item.source,
        sourceUrl: item.url,
      })
    }
  }

  // Perform on-the-fly match analysis with the AI Agent
  const handleStartAnalysis = (item: any) => {
    setActiveAnalysisCardId(item.id)
    setMatchAnalysisResult(null)
    setSelectedMatchEntityId('')
  }

  const executeAIAnalysis = (item: any) => {
    if (!selectedMatchEntityId) return

    let vacancyData: any
    let resumeData: any

    if (searchType === 'vacancy') {
      // We are matching a scraped vacancy against a saved resume from the DB
      const dbResume = savedResumes?.find((r: any) => r.id === selectedMatchEntityId)
      if (!dbResume) return

      vacancyData = {
        title: item.title,
        description: item.description
      }
      resumeData = {
        name: dbResume.fullName,
        position: dbResume.position,
        skills: dbResume.skills,
        experience: dbResume.experience || '',
        education: dbResume.education || ''
      }
    } else {
      // We are matching a scraped resume against a saved vacancy from the DB
      const dbVacancy = savedVacancies?.find((v: any) => v.id === selectedMatchEntityId)
      if (!dbVacancy) return

      vacancyData = {
        title: dbVacancy.title,
        description: dbVacancy.description
      }
      resumeData = {
        name: item.candidateName || 'Соискатель',
        position: item.title,
        skills: item.skills || [],
        experience: item.description,
        education: ''
      }
    }

    analyzeMatchMutation.mutate({
      vacancy: vacancyData,
      resume: resumeData
    }, {
      onSuccess: (data) => {
        setMatchAnalysisResult(data)
      }
    })
  }

  return (
    <div className="grid gap-8 p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <Typography variant="h1" className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            Умный Поиск
          </Typography>
          <Typography tone="muted" className="text-lg">
            Мульти-платформенный поиск вакансий и резюме с поддержкой мгновенной AI-оценки
          </Typography>
        </div>

        {/* Toggle Search Type */}
        <div className="bg-muted p-1.5 rounded-xl inline-flex gap-1 self-start md:self-auto border border-border/50">
          <Button
            variant={searchType === 'vacancy' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setSearchType('vacancy')
              setPage(0)
              setMatchAnalysisResult(null)
              setActiveAnalysisCardId(null)
            }}
            className="rounded-lg px-4"
          >
            Вакансии
          </Button>
          <Button
            variant={searchType === 'resume' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setSearchType('resume')
              setPage(0)
              setMatchAnalysisResult(null)
              setActiveAnalysisCardId(null)
            }}
            className="rounded-lg px-4"
          >
            Резюме
          </Button>
        </div>
      </div>

      {/* Advanced Search Form */}
      <Card className="border border-border/40 bg-card/60 backdrop-blur-md shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="grid gap-6">
            {/* Keyword search & Submit */}
            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Ключевые слова, стек или должность</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={searchType === 'vacancy' ? "Например: React разработчик, Node.js, UI/UX" : "Например: Python инженер, QA Automation"}
                    className="pr-10 h-11 bg-background/50 border-border/60 focus:border-primary"
                  />
                  <div className="absolute right-3 top-3.5 opacity-40">
                    <svg viewBox="0 0 24 24" className="size-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.71 20.29l-3.68-3.68A8.963 8.963 0 0020 11c0-4.96-4.04-9-9-9s-9 4.04-9 9 4.04 9 9 9c2.12 0 4.07-.74 5.61-1.97l3.68 3.68c.2.2.45.29.71.29s.51-.1.71-.29c.39-.39.39-1.03 0-1.42zM4 11c0-3.86 3.14-7 7-7s7 3.14 7 7-3.14 7-7 7-7-3.14-7-7z"/>
                    </svg>
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} size="lg" className="h-11 px-8 font-semibold shadow-md bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white">
                  {isLoading ? <Spinner className="size-4 mr-2" /> : 'Найти'}
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Платформа</Label>
                <Select value={selectedSource} onValueChange={(val: any) => setSelectedSource(val)}>
                  <SelectTrigger className="bg-background/40">
                    <SelectValue placeholder="Все платформы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все платформы</SelectItem>
                    <SelectItem value="work.ua">Work.ua (Украина)</SelectItem>
                    <SelectItem value="robota.ua">Robota.ua (Украина)</SelectItem>
                    <SelectItem value="linkedin">LinkedIn (Global)</SelectItem>
                    <SelectItem value="hh.ru">HeadHunter (hh.ru)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Локация / Регион</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Например: Киев, Удаленно"
                  className="bg-background/40"
                />
              </div>

              <div className="grid gap-2 justify-end items-end">
                <Typography variant="bodySm" tone="muted" className="text-right sm:mt-0 mt-2">
                  Используйте ключевые слова для сужения круга результатов
                </Typography>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {error && (
        <Card className="p-6 border-destructive/50 bg-destructive/10">
          <Typography className="text-destructive font-semibold">Произошла ошибка при выполнении поиска</Typography>
          <Typography tone="muted" variant="bodySm" className="text-destructive/80 mt-1">{error.message}</Typography>
        </Card>
      )}

      {results && (
        <div className="grid gap-6">
          {/* Header of results */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
            <Typography variant="h3" className="text-xl font-bold">
              Результаты ({results.length})
            </Typography>
            
            {/* Pagination Controls */}
            {results.length > 0 && (
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="h-8 rounded-lg"
                >
                  Назад
                </Button>
                <Typography variant="bodySm" className="font-medium px-2">
                  Страница {page + 1}
                </Typography>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={results.length < 20}
                  className="h-8 rounded-lg"
                >
                  Вперед
                </Button>
              </div>
            )}
          </div>

          {/* Cards List */}
          <div className="grid gap-6">
            {results.map((item: any) => {
              const isAnalyzing = activeAnalysisCardId === item.id
              const isSaved = searchType === 'vacancy' 
                ? saveVacancyMutation.isSuccess && saveVacancyMutation.variables?.sourceUrl === item.url
                : saveResumeMutation.isSuccess && saveResumeMutation.variables?.sourceUrl === item.url

              return (
                <Card key={item.id} className="relative overflow-hidden border border-border/40 hover:border-primary/40 hover:shadow-md transition-all duration-300 bg-card/45 backdrop-blur-sm">
                  {/* Colorful source label strip */}
                  <div className={`absolute top-0 left-0 right-0 h-[3px] ${
                    item.source === 'work.ua' ? 'bg-[#e62e2d]' : 
                    item.source === 'robota.ua' ? 'bg-[#0056cc]' : 
                    item.source === 'linkedin' ? 'bg-[#0a66c2]' : 'bg-[#e41b13]'
                  }`} />

                  <CardHeader className="pb-3 pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <SourceLogo source={item.source} />
                          <Badge variant="outline" className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md">
                            {item.source}
                          </Badge>
                          {item.location && (
                            <Typography variant="bodySm" tone="muted" className="flex items-center gap-1">
                              📍 {item.location}
                            </Typography>
                          )}
                        </div>

                        {/* Title */}
                        <CardTitle className="text-xl font-bold mt-2 hover:text-primary transition-colors">
                          {searchType === 'vacancy' ? item.title : item.candidateName || 'Соискатель'}
                        </CardTitle>

                        {/* Subtitle / Company / Role */}
                        {searchType === 'vacancy' ? (
                          <Typography tone="muted" className="font-semibold text-sm mt-1">
                            {item.company}
                          </Typography>
                        ) : (
                          <Typography tone="muted" className="font-semibold text-sm mt-1">
                            {item.title}
                          </Typography>
                        )}
                      </div>

                      {/* Salary Tag */}
                      <div className="flex flex-col items-end gap-1">
                        {item.salaryFrom ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1 font-bold text-sm rounded-lg">
                            {item.salaryFrom.toLocaleString()}{item.salaryTo && item.salaryTo !== item.salaryFrom ? ` - ${item.salaryTo.toLocaleString()}` : ''} {item.currency || 'UAH'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="px-3 py-1 text-xs rounded-lg">ЗП не указана</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Description Snippet */}
                    <div className="bg-muted/30 p-3.5 rounded-lg border border-border/30">
                      <Typography variant="bodySm" tone="muted" className="line-clamp-3 leading-relaxed">
                        {item.description}
                      </Typography>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex gap-2">
                        {/* Save button */}
                        <Button
                          size="sm"
                          onClick={() => handleSaveItem(item)}
                          disabled={saveVacancyMutation.isPending || saveResumeMutation.isPending || isSaved}
                          className="font-medium"
                        >
                          {saveVacancyMutation.isPending || saveResumeMutation.isPending ? (
                            <Spinner className="size-4 mr-2" />
                          ) : isSaved ? (
                            'Сохранено ✓'
                          ) : (
                            'Сохранить в базу'
                          )}
                        </Button>

                        {/* View Source Link */}
                        <Button size="sm" variant="outline" asChild className="border-border/60 hover:bg-muted/50">
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            Открыть оригинал
                          </a>
                        </Button>
                      </div>

                      {/* AI Agent match button */}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStartAnalysis(item)}
                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/30"
                      >
                        ⚡ AI Анализ соответствия
                      </Button>
                    </div>

                    {/* AI Scoring Agent Expansion Panel */}
                    {isAnalyzing && (
                      <div className="mt-4 p-4 rounded-xl border border-indigo-200/60 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/10 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="grid gap-1">
                            <Typography variant="bodySm" className="font-semibold text-indigo-700 dark:text-indigo-400">
                              {searchType === 'vacancy' 
                                ? 'С кем из базы сравнить эту вакансию?' 
                                : 'Для какой вакансии из базы сделать оценку?'
                              }
                            </Typography>
                            
                            {/* Dropdown selectors for PostgreSQL Entities */}
                            <div className="flex items-center gap-2 mt-1">
                              <Select value={selectedMatchEntityId} onValueChange={setSelectedMatchEntityId}>
                                <SelectTrigger className="w-[280px] bg-background/80 border-indigo-200 focus:ring-indigo-500">
                                  <SelectValue placeholder={searchType === 'vacancy' ? 'Выберите резюме из базы...' : 'Выберите вакансию из базы...'} />
                                </SelectTrigger>
                                <SelectContent>
                                  {searchType === 'vacancy' 
                                    ? savedResumes?.map((res: any) => (
                                        <SelectItem key={res.id} value={res.id}>{res.fullName} ({res.position})</SelectItem>
                                      ))
                                    : savedVacancies?.map((vac: any) => (
                                        <SelectItem key={vac.id} value={vac.id}>{vac.title} - {vac.company}</SelectItem>
                                      ))
                                  }
                                  {((searchType === 'vacancy' && !savedResumes?.length) || (searchType === 'resume' && !savedVacancies?.length)) && (
                                    <SelectItem value="none" disabled>База данных пуста</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>

                              <Button
                                size="sm"
                                disabled={!selectedMatchEntityId || analyzeMatchMutation.isPending}
                                onClick={() => executeAIAnalysis(item)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                              >
                                {analyzeMatchMutation.isPending ? <Spinner className="size-4" /> : 'Запустить AI-Анализ'}
                              </Button>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setActiveAnalysisCardId(null)
                              setMatchAnalysisResult(null)
                            }}
                            className="text-muted-foreground hover:text-foreground h-8 px-2"
                          >
                            Закрыть
                          </Button>
                        </div>

                        {/* AI Analysis Result Board */}
                        {analyzeMatchMutation.isPending && (
                          <div className="flex flex-col items-center justify-center py-8 gap-3 border border-dashed border-indigo-200/40 rounded-lg">
                            <Spinner className="size-8 text-indigo-500" />
                            <Typography variant="bodySm" tone="muted" className="animate-pulse">
                              ИИ-Агент анализирует стек технологий, опыт и зарплату...
                            </Typography>
                          </div>
                        )}

                        {matchAnalysisResult && (
                          <div className="border border-indigo-200/40 dark:border-indigo-900/30 rounded-xl p-5 bg-background/90 space-y-4 shadow-sm animate-in zoom-in-95 duration-200">
                            {/* Score header */}
                            <div className="flex items-center gap-4">
                              <div className="relative size-16 flex items-center justify-center">
                                {/* Beautiful circular score visualization */}
                                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                  <path
                                    className="text-muted/20"
                                    strokeWidth="3.5"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <path
                                    className={`${
                                      matchAnalysisResult.score >= 75 ? 'text-emerald-500' :
                                      matchAnalysisResult.score >= 50 ? 'text-amber-500' : 'text-rose-500'
                                    }`}
                                    strokeDasharray={`${matchAnalysisResult.score}, 100`}
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                </svg>
                                <span className="absolute font-extrabold text-base">
                                  {matchAnalysisResult.score}%
                                </span>
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <Typography variant="h4" className="text-lg font-bold">
                                    Соответствие кандидата
                                  </Typography>
                                  <Badge className={
                                    matchAnalysisResult.verdict === 'strong_match' ? 'bg-emerald-500 text-white' :
                                    matchAnalysisResult.verdict === 'potential_match' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                                  }>
                                    {matchAnalysisResult.verdict === 'strong_match' ? 'Рекомендован' :
                                     matchAnalysisResult.verdict === 'potential_match' ? 'Есть риски' : 'Не подходит'}
                                  </Badge>
                                </div>
                                <Typography variant="bodySm" tone="muted" className="mt-0.5">
                                  Анализ выполнен ИИ-рекрутером на лету
                                </Typography>
                              </div>
                            </div>

                            <Separator className="bg-border/50" />

                            {/* Summary text */}
                            <div className="space-y-1">
                              <Typography variant="bodySm" className="font-bold text-foreground">
                                Резюме оценки
                              </Typography>
                              <Typography variant="bodySm" tone="muted" className="leading-relaxed">
                                {matchAnalysisResult.summary}
                              </Typography>
                            </div>

                            {/* Pros & Cons list */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                                <Typography variant="bodySm" className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                  ✓ Преимущества
                                </Typography>
                                <ul className="list-disc pl-4 space-y-1">
                                  {matchAnalysisResult.pros.map((pro: string, idx: number) => (
                                    <li key={idx}>
                                      <Typography variant="bodySm" tone="muted" className="text-emerald-900/80 dark:text-emerald-100/70">
                                        {pro}
                                      </Typography>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="space-y-2 bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">
                                <Typography variant="bodySm" className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                                  ⚠️ Недостатки / Риски
                                </Typography>
                                <ul className="list-disc pl-4 space-y-1">
                                  {matchAnalysisResult.cons.map((con: string, idx: number) => (
                                    <li key={idx}>
                                      <Typography variant="bodySm" tone="muted" className="text-rose-900/80 dark:text-rose-100/70">
                                        {con}
                                      </Typography>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Recommendations / Questions */}
                            {matchAnalysisResult.recommendations && matchAnalysisResult.recommendations.length > 0 && (
                              <div className="bg-indigo-500/5 p-4 rounded-lg border border-indigo-500/10 space-y-2">
                                <Typography variant="bodySm" className="font-bold text-indigo-700 dark:text-indigo-400">
                                  💡 Вопросы для интервью / Рекомендации
                                </Typography>
                                <ul className="list-decimal pl-4 space-y-1.5">
                                  {matchAnalysisResult.recommendations.map((rec: string, idx: number) => (
                                    <li key={idx}>
                                      <Typography variant="bodySm" tone="muted" className="text-indigo-900/80 dark:text-indigo-100/70">
                                        {rec}
                                      </Typography>
                                    </li>
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
            <Card className="p-12 text-center border border-dashed border-border/60 bg-muted/20">
              <Typography tone="muted" className="text-lg">
                По вашему запросу ничего не найдено. Попробуйте изменить ключевые слова или сбросить фильтры.
              </Typography>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
