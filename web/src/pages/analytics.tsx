import { useState, useMemo } from 'react'
import {
  useVacancies,
  useResumes,
  useMatches,
  useSalaryReports,
  useCreateSalaryReport,
} from '@/hooks/use-hr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SalaryReport } from '@hr-recruiter/contracts'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports' | 'market'>('analytics')

  const vacancies = useVacancies()
  const resumes = useResumes()
  const matches = useMatches()
  const salaryReports = useSalaryReports()
  const createSalaryReport = useCreateSalaryReport()

  const [salaryPosition, setSalaryPosition] = useState('')
  const [salaryLocation, setSalaryLocation] = useState('')
  const [creatingReport, setCreatingReport] = useState(false)
  const [selectedVacancyId, setSelectedVacancyId] = useState('')
  const [generatedReport, setGeneratedReport] = useState<any>(null)
  const [generatingReport, setGeneratingReport] = useState(false)

  const isLoading =
    vacancies.isLoading ||
    resumes.isLoading ||
    matches.isLoading ||
    salaryReports.isLoading

  const totals = useMemo(() => {
    const totalVacancies = vacancies.data?.length ?? 0
    const activeVacancies = vacancies.data?.filter((v) => v.status === 'active').length ?? 0
    const totalResumes = resumes.data?.length ?? 0
    const totalMatches = matches.data?.length ?? 0
    const avgMatchScore = totalMatches
      ? Math.round(matches.data!.reduce((sum: number, m) => sum + m.score, 0) / totalMatches)
      : 0
    const hiredCount = resumes.data?.filter((r) => r.status === 'hired').length ?? 0
    const conversionRate = totalResumes ? Math.round((hiredCount / totalResumes) * 100) : 0

    return { totalVacancies, activeVacancies, totalResumes, avgMatchScore, hiredCount, conversionRate }
  }, [vacancies.data, resumes.data, matches.data])

  const dynamicsData = useMemo(() => {
    if (!resumes.data || !matches.data) return []
    const datesMap: Record<string, { date: string; 'Нові резюме': number; 'Нові матчі': number }> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
      datesMap[dateStr] = { date: dateStr, 'Нові резюме': 0, 'Нові матчі': 0 }
    }
    resumes.data.forEach((r) => {
      const dateStr = new Date(r.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
      if (dateStr in datesMap) datesMap[dateStr]['Нові резюме']++
    })
    matches.data.forEach((m) => {
      const dateStr = new Date(m.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
      if (dateStr in datesMap) datesMap[dateStr]['Нові матчі']++
    })
    return Object.values(datesMap)
  }, [resumes.data, matches.data])

  const funnelData = useMemo(() => {
    if (!resumes.data) return []
    const counts = { new: 0, contact: 0, interview: 0, offer: 0, hired: 0, rejected: 0 }
    resumes.data.forEach((r) => {
      if (r.status in counts) counts[r.status as keyof typeof counts]++
    })
    return [
      { name: 'Нові резюме', count: counts.new, fill: 'hsl(var(--chart-1))' },
      { name: 'Контакт', count: counts.contact, fill: 'hsl(var(--chart-2))' },
      { name: 'Співбесіда', count: counts.interview, fill: 'hsl(var(--chart-3))' },
      { name: 'Оффер', count: counts.offer, fill: 'hsl(var(--chart-4))' },
      { name: 'Найняті', count: counts.hired, fill: 'hsl(var(--chart-5))' },
      { name: 'Відхилені', count: counts.rejected, fill: 'hsl(var(--destructive))' },
    ]
  }, [resumes.data])

  const skillsData = useMemo(() => {
    if (!resumes.data) return []
    const countMap: Record<string, number> = {}
    resumes.data.forEach((r) => {
      if (Array.isArray(r.skills)) {
        r.skills.forEach((s: string) => {
          const cleaned = s.trim()
          if (cleaned) countMap[cleaned] = (countMap[cleaned] || 0) + 1
        })
      }
    })
    return Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [resumes.data])

  const matchBrackets = useMemo(() => {
    if (!matches.data) return []
    let high = 0, medium = 0, low = 0
    matches.data.forEach((m) => {
      if (m.score >= 80) high++
      else if (m.score >= 60) medium++
      else low++
    })
    return [
      { name: 'Висока (80-100%)', value: high, color: 'hsl(var(--chart-5))' },
      { name: 'Середня (60-80%)', value: medium, color: 'hsl(var(--chart-4))' },
      { name: 'Низька (<60%)', value: low, color: 'hsl(var(--destructive))' },
    ].filter(item => item.value > 0)
  }, [matches.data])

  const salaryComparisonData = useMemo(() => {
    if (!resumes.data || !vacancies.data) return []
    const positionsSet = new Set<string>()
    resumes.data.forEach((r) => { if (r.position) positionsSet.add(r.position.trim()) })
    vacancies.data.forEach((v) => { if (v.title) positionsSet.add(v.title.trim()) })
    const topPositions = Array.from(positionsSet).slice(0, 5)
    return topPositions.map(pos => {
      const candidateSalaries = resumes.data
        ?.filter((r) => r.position?.trim().toLowerCase() === pos.toLowerCase() && r.salary)
        .map((r) => r.salary as number) || []
      const avgCandidate = candidateSalaries.length
        ? Math.round(candidateSalaries.reduce((sum: number, val: number) => sum + val, 0) / candidateSalaries.length)
        : 0
      const vacancyBudgets = vacancies.data
        ?.filter((v) => v.title?.trim().toLowerCase() === pos.toLowerCase() && (v.salaryFrom || v.salaryTo))
        .map((v) => {
          if (v.salaryFrom && v.salaryTo) return (v.salaryFrom + v.salaryTo) / 2
          return v.salaryFrom || v.salaryTo || 0
        }) || []
      const avgVacancy = vacancyBudgets.length
        ? Math.round(vacancyBudgets.reduce((sum: number, val: number) => sum + val, 0) / vacancyBudgets.length)
        : 0
      return {
        position: pos,
        'Очікування кандидатів': avgCandidate || null,
        'Бюджет вакансій': avgVacancy || null,
      }
    }).filter(item => item['Очікування кандидатів'] !== null || item['Бюджет вакансій'] !== null)
  }, [resumes.data, vacancies.data])

  const handleExportCSV = () => {
    if (!matches.data || matches.data.length === 0) return
    const headers = ['Кандидат', 'Email', 'Телефон', 'Посада', 'Зарплатні очікування', 'Навички', 'Статус кандидата', 'Вакансія', 'Бюджет вакансії (від-до)', 'Рівень відповідності (Score)', 'Статус матчу', 'Дата створення']
    const rows = matches.data.map((m) => {
      const resume = m.resume
      const vacancy = m.vacancy
      return [
        resume?.fullName || '', resume?.email || '', resume?.phone || '', resume?.position || '',
        resume?.salary ? `${resume.salary} ${resume.currency}` : 'Не вказано', resume?.skills?.join(', ') || '', resume?.status || '',
        vacancy?.title || '', vacancy?.salaryFrom || vacancy?.salaryTo ? `${vacancy.salaryFrom || 0} - ${vacancy.salaryTo || 0} ${vacancy.currency}` : 'Не вказано',
        `${m.score}%`, m.status, new Date(m.createdAt).toLocaleDateString('uk-UA'),
      ]
    })
    const csvContent = [
      headers.join(','),
      ...rows.map((row: string[]) => row.map((val: string) => `"${String(val).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `hr_analytics_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrintPDF = () => { window.print() }

  const handleGenerateVacancyReport = () => {
    if (!selectedVacancyId) return
    setGeneratingReport(true)
    setTimeout(() => {
      const vacancy = vacancies.data?.find((v) => v.id === selectedVacancyId)
      if (!vacancy) return
      const matched = matches.data?.filter((m) => m.vacancyId === selectedVacancyId) || []
      const sortedMatched = [...matched].sort((a, b) => b.score - a.score)
      const avgScore = matched.length ? Math.round(matched.reduce((sum: number, m) => sum + m.score, 0) / matched.length) : 0
      const counts = { new: 0, contact: 0, interview: 0, offer: 0, hired: 0, rejected: 0 }
      matched.forEach((m) => {
        const status = m.resume?.status
        if (status && status in counts) counts[status as keyof typeof counts]++
      })
      const candidateSalaries = matched.map((m) => m.resume?.salary).filter(Boolean) as number[]
      const avgCandidateSalary = candidateSalaries.length ? Math.round(candidateSalaries.reduce((a: number, b: number) => a + b, 0) / candidateSalaries.length) : 0
      const vacancyAvgBudget = (vacancy.salaryFrom && vacancy.salaryTo) ? (vacancy.salaryFrom + vacancy.salaryTo) / 2 : vacancy.salaryFrom || vacancy.salaryTo || 0
      const insights: string[] = []
      if (vacancyAvgBudget && avgCandidateSalary > vacancyAvgBudget * 1.1) {
        const pct = Math.round(((avgCandidateSalary - vacancyAvgBudget) / vacancyAvgBudget) * 100)
        insights.push(`Середня очікувана зарплата кандидатів ($${avgCandidateSalary}) на ${pct}% перевищує середній запланований бюджет вакансії ($${vacancyAvgBudget}). Рекомендується збільшити ліміт бюджету або розглянути менш досвідчених кандидатів.`)
      } else if (vacancyAvgBudget) {
        insights.push(`Бюджет вакансії ($${vacancyAvgBudget}) відповідає очікуванням кандидатів (в середньому $${avgCandidateSalary}). Пропозиція приваблива на ринку.`)
      }
      if (avgScore < 70 && matched.length > 0) {
        insights.push(`Рівень відповідності кандидатів вимогам відносно низький (середній Score: ${avgScore}%). Рекомендується перевірити та зробити точнішим опис вакансії або додати додаткові навички в картку вакансії для точнішого пошуку.`)
      } else if (avgScore >= 80) {
        insights.push(`Дуже висока відповідність кандидатів (середній Score: ${avgScore}%). Кандидати мають відповідний стек технологій. Рекомендуємо швидше призначати технічні співбесіди.`)
      }
      if (counts.interview === 0 && counts.new > 0) {
        insights.push(`Усі кандидати знаходяться на початкових етапах. Рекомендується перевести лідерів скорингу на етап "Співбесіда".`)
      }
      setGeneratedReport({ vacancy, totalApplicants: matched.length, avgScore, funnel: counts, avgCandidateSalary, vacancyAvgBudget, topCandidates: sortedMatched.slice(0, 5), insights })
      setGeneratingReport(false)
    }, 800)
  }

  const handleCreateMarketReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salaryPosition) return
    setCreatingReport(true)
    try {
      await createSalaryReport.mutateAsync({ position: salaryPosition, location: salaryLocation || undefined })
      setSalaryPosition('')
      setSalaryLocation('')
    } catch (err) {
      console.error('Failed to create salary report:', err)
    } finally {
      setCreatingReport(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2">Аналітика та Звіти</Typography>
          <Typography tone="muted" className="mt-1">Дані рекрутингу, ринкові зарплати та автоматична генерація звітів</Typography>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button onClick={handleExportCSV} variant="outline" size="sm">Експорт в Excel (CSV)</Button>
          <Button onClick={handlePrintPDF} size="sm">Друк / PDF</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="print:hidden">
        <TabsList>
          <TabsTrigger value="analytics">Загальна Аналітика</TabsTrigger>
          <TabsTrigger value="reports">Генератор Звітів</TabsTrigger>
          <TabsTrigger value="market">Ринкові Зарплати ({salaryReports.data?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Всього Вакансій</CardDescription>
                <CardTitle className="text-3xl font-bold">{totals.totalVacancies}</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="bodySm" tone="muted">Активних: <span className="font-semibold text-primary">{totals.activeVacancies}</span></Typography>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>База кандидатів</CardDescription>
                <CardTitle className="text-3xl font-bold">{totals.totalResumes}</CardTitle>
              </CardHeader>
              <CardContent><Typography variant="bodySm" tone="muted">Резюме в системі</Typography></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Середній Match Score</CardDescription>
                <CardTitle className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totals.avgMatchScore}%</CardTitle>
              </CardHeader>
              <CardContent><Typography variant="bodySm" tone="muted">По всіх вакансіях</Typography></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Найнято кандидатів</CardDescription>
                <CardTitle className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totals.hiredCount}</CardTitle>
              </CardHeader>
              <CardContent><Typography variant="bodySm" tone="muted">Конверсія: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{totals.conversionRate}%</span></Typography></CardContent>
            </Card>
          </div>

          {/* Dynamics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Динаміка рекрутингової активності</CardTitle>
              <CardDescription>Кількість доданих резюме та створених матчів за останні 7 днів</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorResumes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="Нові резюме" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorResumes)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Нові матчі" stroke="hsl(var(--chart-3))" fillOpacity={1} fill="url(#colorMatches)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Воронка кандидатів за статусами</CardTitle>
                <CardDescription>Розподіл кандидатів на етапах найму</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={funnelData} margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" className="text-xs" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Популярні навички кандидатів</CardTitle>
                <CardDescription>Найчастіші теги у резюме</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {skillsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillsData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Typography tone="muted">Немає даних про навички</Typography>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Match Brackets */}
            <Card>
              <CardHeader>
                <CardTitle>Якість відповідності кандидатів</CardTitle>
                <CardDescription>Співвідношення оцінок (Match Score)</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                {matchBrackets.length > 0 ? (
                  <div className="w-full h-full flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 h-full min-h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={matchBrackets} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                            {matchBrackets.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 shrink-0 pr-4">
                      {matchBrackets.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-muted-foreground">{item.name}: <strong className="text-foreground">{item.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Typography tone="muted">Немає сформованих матчів</Typography>
                )}
              </CardContent>
            </Card>

            {/* Salary Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Порівняння зарплатних очікувань</CardTitle>
                <CardDescription>Середній бюджет вакансій vs очікування кандидатів (USD)</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {salaryComparisonData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salaryComparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                      <XAxis dataKey="position" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="Бюджет вакансій" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Очікування кандидатів" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Typography tone="muted">Недостатньо зарплатних даних для відображення</Typography>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Генератор Звітів по вакансіях</CardTitle>
              <CardDescription>Виберіть вакансію, щоб зібрати повну аналітику кандидатів, воронки та рекомендації.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="grid gap-2 flex-1">
                  <Label>Оберіть вакансію</Label>
                  <Select value={selectedVacancyId} onValueChange={setSelectedVacancyId}>
                    <SelectTrigger><SelectValue placeholder="-- Оберіть вакансію зі списку --" /></SelectTrigger>
                    <SelectContent>
                      {vacancies.data?.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.title} ({v.company})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGenerateVacancyReport} disabled={!selectedVacancyId || generatingReport} className="sm:w-auto w-full">
                  {generatingReport ? 'Збирання даних...' : 'Згенерувати звіт'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {generatedReport && (
            <Card className="max-w-4xl mx-auto p-4 sm:p-8">
              <div className="border-b pb-6 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="mb-2 bg-primary/10 text-primary font-semibold">Аналітичний Звіт</Badge>
                    <Typography variant="h3" className="font-bold">{generatedReport.vacancy.title}</Typography>
                    <Typography tone="muted" className="text-sm">Компанія: {generatedReport.vacancy.company} | Локація: {generatedReport.vacancy.location || 'Remote'}</Typography>
                  </div>
                  <Typography variant="bodySm" tone="muted" className="text-right text-xs">Згенеровано: <br /> {new Date().toLocaleDateString('uk-UA')}</Typography>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-dashed">
                <div className="text-center bg-muted/50 p-4 rounded-lg">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Всього відгуків</span>
                  <span className="text-2xl font-extrabold">{generatedReport.totalApplicants}</span>
                </div>
                <div className="text-center bg-muted/50 p-4 rounded-lg">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Середній Match Score</span>
                  <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{generatedReport.avgScore}%</span>
                </div>
                <div className="text-center bg-muted/50 p-4 rounded-lg">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Запланований бюджет</span>
                  <span className="text-2xl font-extrabold">{generatedReport.vacancyAvgBudget ? `$${generatedReport.vacancyAvgBudget}` : 'Не вказано'}</span>
                </div>
                <div className="text-center bg-muted/50 p-4 rounded-lg">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Очікування ринку</span>
                  <span className="text-2xl font-extrabold">{generatedReport.avgCandidateSalary ? `$${generatedReport.avgCandidateSalary}` : 'Не вказано'}</span>
                </div>
              </div>

              <div className="py-6 border-b">
                <Typography variant="h6" className="font-semibold mb-4">Розподіл кандидатів по етапах</Typography>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="border rounded-lg p-3 text-center bg-muted/50">
                    <span className="text-xs text-muted-foreground block">Нові</span>
                    <span className="text-lg font-bold">{generatedReport.funnel.new}</span>
                  </div>
                  <div className="border rounded-lg p-3 text-center bg-muted/50">
                    <span className="text-xs text-muted-foreground block">Контакт</span>
                    <span className="text-lg font-bold">{generatedReport.funnel.contact}</span>
                  </div>
                  <div className="border rounded-lg p-3 text-center bg-muted/50">
                    <span className="text-xs text-muted-foreground block">Співбесіда</span>
                    <span className="text-lg font-bold">{generatedReport.funnel.interview}</span>
                  </div>
                  <div className="border rounded-lg p-3 text-center bg-muted/50">
                    <span className="text-xs text-muted-foreground block">Оффер</span>
                    <span className="text-lg font-bold">{generatedReport.funnel.offer}</span>
                  </div>
                  <div className="border rounded-lg p-3 text-center bg-muted/50">
                    <span className="text-xs text-muted-foreground block">Найнято</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{generatedReport.funnel.hired}</span>
                  </div>
                </div>
              </div>

              <div className="py-6 border-b">
                <Typography variant="h6" className="font-semibold mb-4">Топ кандидатів за відповідністю</Typography>
                {generatedReport.topCandidates.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="py-2.5 px-3 font-semibold text-muted-foreground">ПІБ Кандидата</th>
                          <th className="py-2.5 px-3 font-semibold text-muted-foreground">Посада</th>
                          <th className="py-2.5 px-3 font-semibold text-muted-foreground">Очікування</th>
                          <th className="py-2.5 px-3 font-semibold text-muted-foreground text-right">Match Score</th>
                          <th className="py-2.5 px-3 font-semibold text-muted-foreground">Етап</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedReport.topCandidates.map((m: { score: number; resume?: { fullName?: string; position?: string; salary?: number | null; status?: string } }, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-muted/50">
                            <td className="py-2.5 px-3 font-medium">{m.resume?.fullName}</td>
                            <td className="py-2.5 px-3 text-muted-foreground">{m.resume?.position}</td>
                            <td className="py-2.5 px-3 text-muted-foreground">{m.resume?.salary ? `$${m.resume.salary}` : 'Не вказано'}</td>
                            <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">{m.score}%</td>
                            <td className="py-2.5 px-3 text-muted-foreground capitalize">{m.resume?.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Typography tone="muted" className="text-xs">Кандидати ще не додані або немає матчів.</Typography>
                )}
              </div>

              <div className="py-6 space-y-3">
                <Typography variant="h6" className="font-semibold">Рекомендації та Інсайти</Typography>
                {generatedReport.insights.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2 text-xs text-muted-foreground">
                    {generatedReport.insights.map((ins: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{ins}</li>
                    ))}
                  </ul>
                ) : (
                  <Typography tone="muted" className="text-xs">Система зібрала недостатньо даних для генерації розширених порад.</Typography>
                )}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Запит ринкової зарплати</CardTitle>
              <CardDescription>Отримайте інформацію про середні, мінімальні та максимальні зарплати за спеціалізаціями.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateMarketReport} className="grid sm:grid-cols-3 gap-4 items-end">
                <div className="grid gap-2">
                  <Label>Спеціалізація / Посада</Label>
                  <Input placeholder="React Developer, QA Engineer..." value={salaryPosition} onChange={(e) => setSalaryPosition(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label>Локація / Країна</Label>
                  <Input placeholder="Київ, Remote, etc." value={salaryLocation} onChange={(e) => setSalaryLocation(e.target.value)} />
                </div>
                <Button type="submit" disabled={creatingReport || !salaryPosition}>{creatingReport ? 'Аналіз...' : 'Створити звіт'}</Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {salaryReports.data && salaryReports.data.length > 0 ? (
              salaryReports.data.map((report: SalaryReport) => (
                <Card key={report.id}>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base font-semibold">{report.position}</CardTitle>
                        <CardDescription className="text-xs">Локація: {report.location || 'Всі регіони'}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-[10px]">Джерело: {report.source}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/50 p-2 rounded border">
                        <span className="block text-[9px] text-muted-foreground uppercase font-bold">Мінімум</span>
                        <span className="text-sm font-bold">${report.minSalary.toLocaleString()}</span>
                      </div>
                      <div className="bg-primary/10 border-primary/20 p-2 rounded border">
                        <span className="block text-[9px] text-primary/80 uppercase font-bold">Медіана</span>
                        <span className="text-sm font-bold text-primary">${report.avgSalary.toLocaleString()}</span>
                      </div>
                      <div className="bg-muted/50 p-2 rounded border">
                        <span className="block text-[9px] text-muted-foreground uppercase font-bold">Максимум</span>
                        <span className="text-sm font-bold">${report.maxSalary.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t">
                      <span>Створено: {new Date(report.createdAt).toLocaleDateString('uk-UA')}</span>
                      <span>Валюта: {report.currency}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center border-dashed">
                <Typography tone="muted">Немає ринкових звітів. Скористайтеся формою вище для аналізу.</Typography>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
