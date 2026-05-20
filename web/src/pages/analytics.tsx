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
import { Spinner } from '@/components/ui/spinner'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Vacancy, Resume, Match, SalaryReport } from '@hr-recruiter/contracts'
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
  
  // Queries
  const vacancies = useVacancies()
  const resumes = useResumes()
  const matches = useMatches()
  const salaryReports = useSalaryReports()
  const createSalaryReport = useCreateSalaryReport()
  
  // Form states for Market Salary Report
  const [salaryPosition, setSalaryPosition] = useState('')
  const [salaryLocation, setSalaryLocation] = useState('')
  const [creatingReport, setCreatingReport] = useState(false)
  
  // States for Vacancy Report Generator
  const [selectedVacancyId, setSelectedVacancyId] = useState('')
  const [generatedReport, setGeneratedReport] = useState<any>(null)
  const [generatingReport, setGeneratingReport] = useState(false)

  const isLoading = 
    vacancies.isLoading || 
    resumes.isLoading || 
    matches.isLoading || 
    salaryReports.isLoading

  // Calculations for Tab 1: General Analytics
  const totals = useMemo(() => {
    const totalVacancies = vacancies.data?.length ?? 0
    const activeVacancies = vacancies.data?.filter((v: Vacancy) => v.status === 'active').length ?? 0
    
    const totalResumes = resumes.data?.length ?? 0
    
    const totalMatches = matches.data?.length ?? 0
    const avgMatchScore = totalMatches
      ? Math.round(matches.data!.reduce((sum: number, m: Match) => sum + m.score, 0) / totalMatches)
      : 0
      
    const hiredCount = resumes.data?.filter((r: Resume) => r.status === 'hired').length ?? 0
    const conversionRate = totalResumes 
      ? Math.round((hiredCount / totalResumes) * 100) 
      : 0

    return {
      totalVacancies,
      activeVacancies,
      totalResumes,
      avgMatchScore,
      hiredCount,
      conversionRate
    }
  }, [vacancies.data, resumes.data, matches.data])

  // Dynamics (last 7 days trend of added Resumes and created Matches)
  const dynamicsData = useMemo(() => {
    if (!resumes.data || !matches.data) return []
    
    const datesMap: Record<string, { date: string; 'Нові резюме': number; 'Нові матчі': number }> = {}
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
      datesMap[dateStr] = { date: dateStr, 'Нові резюме': 0, 'Нові матчі': 0 }
    }
    
    // Populate resumes count
    resumes.data.forEach((r: Resume) => {
      const dateStr = new Date(r.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
      if (dateStr in datesMap) {
        datesMap[dateStr]['Нові резюме']++
      }
    })
    
    // Populate matches count
    matches.data.forEach((m: Match) => {
      const dateStr = new Date(m.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
      if (dateStr in datesMap) {
        datesMap[dateStr]['Нові матчі']++
      }
    })
    
    return Object.values(datesMap)
  }, [resumes.data, matches.data])

  // Funnel calculations
  const funnelData = useMemo(() => {
    if (!resumes.data) return []
    const counts = {
      new: 0,
      contact: 0,
      interview: 0,
      offer: 0,
      hired: 0,
      rejected: 0
    }
    
    resumes.data.forEach((r: Resume) => {
      if (r.status in counts) {
        counts[r.status as keyof typeof counts]++
      }
    })

    return [
      { name: 'Нові резюме', count: counts.new, fill: '#3b82f6' },
      { name: 'Контакт', count: counts.contact, fill: '#6366f1' },
      { name: 'Співбесіда', count: counts.interview, fill: '#a855f7' },
      { name: 'Оффер', count: counts.offer, fill: '#ec4899' },
      { name: 'Найняті', count: counts.hired, fill: '#10b981' },
      { name: 'Відхилені', count: counts.rejected, fill: '#ef4444' }
    ]
  }, [resumes.data])

  // Top skills aggregation
  const skillsData = useMemo(() => {
    if (!resumes.data) return []
    const countMap: Record<string, number> = {}
    
    resumes.data.forEach((r: Resume) => {
      if (Array.isArray(r.skills)) {
        r.skills.forEach((s: string) => {
          const cleaned = s.trim()
          if (cleaned) {
            countMap[cleaned] = (countMap[cleaned] || 0) + 1
          }
        })
      }
    })

    return Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [resumes.data])

  // Match score brackets
  const matchBrackets = useMemo(() => {
    if (!matches.data) return []
    let high = 0
    let medium = 0
    let low = 0

    matches.data.forEach((m: Match) => {
      if (m.score >= 80) high++
      else if (m.score >= 60) medium++
      else low++
    })

    return [
      { name: 'Висока (80-100%)', value: high, color: '#10b981' },
      { name: 'Середня (60-80%)', value: medium, color: '#f59e0b' },
      { name: 'Низька (<60%)', value: low, color: '#ef4444' }
    ].filter(item => item.value > 0)
  }, [matches.data])

  // Salaries comparison (Vacancy Budget vs Candidate requested salary)
  const salaryComparisonData = useMemo(() => {
    if (!resumes.data || !vacancies.data) return []
    
    const positionsSet = new Set<string>()
    resumes.data.forEach((r: Resume) => {
      if (r.position) positionsSet.add(r.position.trim())
    })
    vacancies.data.forEach((v: Vacancy) => {
      if (v.title) positionsSet.add(v.title.trim())
    })

    const topPositions = Array.from(positionsSet).slice(0, 5)

    return topPositions.map(pos => {
      const candidateSalaries = resumes.data
        ?.filter((r: Resume) => r.position?.trim().toLowerCase() === pos.toLowerCase() && r.salary)
        .map((r: Resume) => r.salary as number) || []
      const avgCandidate = candidateSalaries.length 
        ? Math.round(candidateSalaries.reduce((sum: number, val: number) => sum + val, 0) / candidateSalaries.length)
        : 0

      const vacancyBudgets = vacancies.data
        ?.filter((v: Vacancy) => v.title?.trim().toLowerCase() === pos.toLowerCase() && (v.salaryFrom || v.salaryTo))
        .map((v: Vacancy) => {
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

  // CSV Excel Export
  const handleExportCSV = () => {
    if (!matches.data || matches.data.length === 0) return

    const headers = [
      'Кандидат',
      'Email',
      'Телефон',
      'Посада',
      'Зарплатні очікування',
      'Навички',
      'Статус кандидата',
      'Вакансія',
      'Бюджет вакансії (від-до)',
      'Рівень відповідності (Score)',
      'Статус матчу',
      'Дата створення'
    ]

    const rows = matches.data.map((m: Match) => {
      const resume = m.resume
      const vacancy = m.vacancy
      return [
        resume?.fullName || '',
        resume?.email || '',
        resume?.phone || '',
        resume?.position || '',
        resume?.salary ? `${resume.salary} ${resume.currency}` : 'Не вказано',
        resume?.skills?.join(', ') || '',
        resume?.status || '',
        vacancy?.title || '',
        vacancy?.salaryFrom || vacancy?.salaryTo 
          ? `${vacancy.salaryFrom || 0} - ${vacancy.salaryTo || 0} ${vacancy.currency}` 
          : 'Не вказано',
        `${m.score}%`,
        m.status,
        new Date(m.createdAt).toLocaleDateString('uk-UA')
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row: string[]) => row.map((val: string) => {
        const escaped = String(val).replace(/"/g, '""')
        return `"${escaped}"`
      }).join(','))
    ].join('\n')

    // Prefix with Byte Order Mark for Excel UTF-8 support
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `hr_analytics_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Trigger PDF print of active tab
  const handlePrintPDF = () => {
    window.print()
  }

  // Handle generating single vacancy recruitment report
  const handleGenerateVacancyReport = () => {
    if (!selectedVacancyId) return
    setGeneratingReport(true)
    
    setTimeout(() => {
      const vacancy = vacancies.data?.find((v: Vacancy) => v.id === selectedVacancyId)
      if (!vacancy) return
      
      const matched = matches.data?.filter((m: Match) => m.vacancyId === selectedVacancyId) || []
      const sortedMatched = [...matched].sort((a, b) => b.score - a.score)
      
      const avgScore = matched.length
        ? Math.round(matched.reduce((sum: number, m: Match) => sum + m.score, 0) / matched.length)
        : 0

      // Stats counts
      const counts = { new: 0, contact: 0, interview: 0, offer: 0, hired: 0, rejected: 0 }
      matched.forEach((m: Match) => {
        const status = m.resume?.status
        if (status && status in counts) {
          counts[status as keyof typeof counts]++
        }
      })

      // Salary analysis
      const candidateSalaries = matched.map((m: Match) => m.resume?.salary).filter(Boolean) as number[]
      const avgCandidateSalary = candidateSalaries.length
        ? Math.round(candidateSalaries.reduce((a: number, b: number) => a + b, 0) / candidateSalaries.length)
        : 0
      
      const vacancyAvgBudget = (vacancy.salaryFrom && vacancy.salaryTo)
        ? (vacancy.salaryFrom + vacancy.salaryTo) / 2
        : vacancy.salaryFrom || vacancy.salaryTo || 0

      // Insights
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

      setGeneratedReport({
        vacancy,
        totalApplicants: matched.length,
        avgScore,
        funnel: counts,
        avgCandidateSalary,
        vacancyAvgBudget,
        topCandidates: sortedMatched.slice(0, 5),
        insights
      })
      setGeneratingReport(false)
    }, 800)
  }

  // Create market report
  const handleCreateMarketReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salaryPosition) return
    setCreatingReport(true)
    try {
      await createSalaryReport.mutateAsync({
        position: salaryPosition,
        location: salaryLocation || undefined
      })
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
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {/* Custom Global CSS rules for high fidelity printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          h2, h3, h6, span, p, td, th {
            color: black !important;
          }
        }
      `}} />

      {/* Top Header bar with print layout hide */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 print:hidden">
        <div>
          <Typography variant="h2">Аналітика та Звіти</Typography>
          <Typography tone="muted">Дані рекрутингу, ринкові зарплати та автоматична генерація звітів</Typography>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            Экспорт в Excel (CSV)
          </Button>
          <Button onClick={handlePrintPDF} variant="default" size="sm">
            Друк / PDF
          </Button>
        </div>
      </div>

      {/* Navigation tabs - hidden on print */}
      <div className="flex gap-2 border-b border-white/5 pb-px print:hidden">
        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200",
            activeTab === 'analytics'
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Загальна Аналітика
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200",
            activeTab === 'reports'
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Генератор Звітів
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200",
            activeTab === 'market'
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Ринкові Зарплати ({salaryReports.data?.length ?? 0})
        </button>
      </div>

      {/* Tab 1: General Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Widget Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription>Всього Вакансій</CardDescription>
                <CardTitle className="text-3xl font-bold">{totals.totalVacancies}</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="bodySm" tone="muted">
                  Активних: <span className="font-semibold text-primary">{totals.activeVacancies}</span>
                </Typography>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription>База кандидатів</CardDescription>
                <CardTitle className="text-3xl font-bold">{totals.totalResumes}</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="bodySm" tone="muted">
                  Резюме в системі
                </Typography>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription>Середній Match Score</CardDescription>
                <CardTitle className="text-3xl font-bold text-teal-400">{totals.avgMatchScore}%</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="bodySm" tone="muted">
                  По всіх вакансіях
                </Typography>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription>Найнято кандидатів</CardDescription>
                <CardTitle className="text-3xl font-bold text-emerald-400">{totals.hiredCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="bodySm" tone="muted">
                  Конверсія: <span className="font-semibold text-emerald-400">{totals.conversionRate}%</span>
                </Typography>
              </CardContent>
            </Card>
          </div>

          {/* New Interactive Full Width dynamics area chart */}
          <Card>
            <CardHeader>
              <CardTitle>Динаміка рекрутингової активності</CardTitle>
              <CardDescription>Кількість доданих резюме та створених матчів за останні 7 днів</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dynamicsData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorResumes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="Нові резюме" stroke="#3b82f6" fillOpacity={1} fill="url(#colorResumes)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Нові матчі" stroke="#a855f7" fillOpacity={1} fill="url(#colorMatches)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Graphics Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* 1. Recruitment Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Воронка кандидатів за статусами</CardTitle>
                <CardDescription>Розподіл кандидатів на етапах найму</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={funnelData}
                    margin={{ top: 10, right: 30, left: 30, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={11} width={120} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 2. Top candidate skills */}
            <Card>
              <CardHeader>
                <CardTitle>Популярні навички кандидатів</CardTitle>
                <CardDescription>Найчастіші теги у резюме</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {skillsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={skillsData}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: 30, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="skillsGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                      <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={11} width={80} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar dataKey="count" fill="url(#skillsGradient)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Typography tone="muted">Немає даних про навички</Typography>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3. Match score brackets */}
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
                          <Pie
                            data={matchBrackets}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {matchBrackets.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 shrink-0 pr-4">
                      {matchBrackets.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-muted-foreground">
                            {item.name}: <strong className="text-foreground">{item.value}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Typography tone="muted">Немає сформованих матчів</Typography>
                )}
              </CardContent>
            </Card>

            {/* 4. Salary expectations vs budgets */}
            <Card>
              <CardHeader>
                <CardTitle>Порівняння зарплатних очікувань</CardTitle>
                <CardDescription>Середній бюджет вакансій vs очікування кандидатів (USD)</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {salaryComparisonData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salaryComparisonData}
                      margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="position" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="Бюджет вакансій" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Очікування кандидатів" fill="#a855f7" radius={[4, 4, 0, 0]} />
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
        </div>
      )}

      {/* Tab 2: Vacancy Report Generator */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>Генератор Звітів по вакансіях</CardTitle>
              <CardDescription>Виберіть вакансію, щоб зібрати повну аналітику кандидатів, воронки та рекомендації.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="vacancySelect">Оберіть вакансію</Label>
                  <NativeSelect
                    id="vacancySelect"
                    className="w-full"
                    value={selectedVacancyId}
                    onChange={(e) => setSelectedVacancyId(e.target.value)}
                  >
                    <NativeSelectOption value="">-- Оберіть вакансію зі списку --</NativeSelectOption>
                    {vacancies.data?.map((v: Vacancy) => (
                      <NativeSelectOption key={v.id} value={v.id}>
                        {v.title} ({v.company})
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <Button 
                  onClick={handleGenerateVacancyReport} 
                  disabled={!selectedVacancyId || generatingReport}
                  className="sm:w-auto w-full"
                >
                  {generatingReport ? 'Збирання даних...' : 'Згенерувати звіт'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Report Sheet */}
          {generatedReport && (
            <Card className="max-w-4xl mx-auto p-4 sm:p-8 bg-card border shadow-lg print:border-none print:shadow-none print:bg-white print:text-black">
              {/* Report Header */}
              <div className="border-b pb-6 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="mb-2 bg-primary/20 text-foreground font-semibold">Аналітичний Звіт</Badge>
                    <Typography variant="h3" className="font-bold print:text-black">{generatedReport.vacancy.title}</Typography>
                    <Typography tone="muted" className="text-sm print:text-gray-600">Компанія: {generatedReport.vacancy.company} | Локація: {generatedReport.vacancy.location || 'Remote'}</Typography>
                  </div>
                  <Typography variant="bodySm" tone="muted" className="text-right text-xs print:text-gray-500">
                    Згенеровано: <br /> {new Date().toLocaleDateString('uk-UA')}
                  </Typography>
                </div>
              </div>

              {/* Grid with Vacancy Specific Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-dashed">
                <div className="text-center bg-muted/30 p-4 rounded-lg print:border print:border-gray-200">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Всього відгуків</span>
                  <span className="text-2xl font-extrabold text-foreground print:text-black">{generatedReport.totalApplicants}</span>
                </div>
                <div className="text-center bg-muted/30 p-4 rounded-lg print:border print:border-gray-200">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Середній Match Score</span>
                  <span className="text-2xl font-extrabold text-teal-400 print:text-teal-600">{generatedReport.avgScore}%</span>
                </div>
                <div className="text-center bg-muted/30 p-4 rounded-lg print:border print:border-gray-200">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Запланований бюджет</span>
                  <span className="text-2xl font-extrabold text-foreground print:text-black">
                    {generatedReport.vacancyAvgBudget ? `$${generatedReport.vacancyAvgBudget}` : 'Не вказано'}
                  </span>
                </div>
                <div className="text-center bg-muted/30 p-4 rounded-lg print:border print:border-gray-200">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Очікування ринку</span>
                  <span className="text-2xl font-extrabold text-foreground print:text-black">
                    {generatedReport.avgCandidateSalary ? `$${generatedReport.avgCandidateSalary}` : 'Не вказано'}
                  </span>
                </div>
              </div>

              {/* Recruitment Funnel section for this vacancy */}
              <div className="py-6 border-b">
                <Typography variant="h6" className="font-semibold mb-4 print:text-black">Розподіл кандидатів по етапах</Typography>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="border rounded-lg p-3 text-center bg-muted/10 print:border-gray-200">
                    <span className="text-xs text-muted-foreground block">Нові</span>
                    <span className="text-lg font-bold text-foreground print:text-black">{generatedReport.funnel.new}</span>
                  </div>
                  <div className="border rounded-lg p-3 text-center bg-muted/10 print:border-gray-200">
                    <span className="text-xs text-muted-foreground block">Контакт</span>
                    <span className="text-lg font-bold text-foreground print:text-black">{generatedReport.funnel.contact}</span>
                  </div>
                  <div className="border rounded-lg p-3 text-center bg-muted/10 print:border-gray-200">
                    <span className="text-xs text-muted-foreground block">Співбесіда</span>
                    <span className="text-lg font-bold text-foreground print:text-black">{generatedReport.funnel.interview}</span>
                  </div>
                  <div className="border rounded-lg p-3 text-center bg-muted/10 print:border-gray-200">
                    <span className="text-xs text-muted-foreground block">Оффер</span>
                    <span className="text-lg font-bold text-foreground print:text-black">{generatedReport.funnel.offer}</span>
                  </div>
                  <div className="border rounded-lg p-3 text-center bg-muted/10 print:border-gray-200">
                    <span className="text-xs text-muted-foreground block">Найнято</span>
                    <span className="text-lg font-bold text-emerald-400 print:text-emerald-600">{generatedReport.funnel.hired}</span>
                  </div>
                </div>
              </div>

              {/* Top candidates table */}
              <div className="py-6 border-b">
                <Typography variant="h6" className="font-semibold mb-4 print:text-black">Топ кандидатів за відповідністю</Typography>
                {generatedReport.topCandidates.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b bg-muted/50 print:bg-gray-100">
                          <th className="py-2.5 px-3 font-semibold text-muted-foreground print:text-black">ПІБ Кандидата</th>
                          <th className="py-2.5 px-3 font-semibold text-muted-foreground print:text-black">Посада</th>
                          <th className="py-2.5 px-3 font-semibold text-muted-foreground print:text-black">Очікування</th>
                          <th className="py-2.5 px-3 font-semibold text-muted-foreground print:text-black text-right">Match Score</th>
                          <th className="py-2.5 px-3 font-semibold text-muted-foreground print:text-black">Етап</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedReport.topCandidates.map((m: Match, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-muted/10 print:border-gray-100">
                            <td className="py-2.5 px-3 font-medium text-foreground print:text-black">{m.resume?.fullName}</td>
                            <td className="py-2.5 px-3 text-muted-foreground print:text-gray-600">{m.resume?.position}</td>
                            <td className="py-2.5 px-3 text-muted-foreground print:text-gray-600">
                              {m.resume?.salary ? `$${m.resume.salary}` : 'Не вказано'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-semibold text-teal-400 print:text-teal-600">{m.score}%</td>
                            <td className="py-2.5 px-3 text-muted-foreground print:text-gray-600 capitalize">{m.resume?.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Typography tone="muted" className="text-xs">Кандидати ще не додані або немає матчів.</Typography>
                )}
              </div>

              {/* Insights and AI advices */}
              <div className="py-6 space-y-3">
                <Typography variant="h6" className="font-semibold print:text-black">Рекомендації та Інсайти</Typography>
                {generatedReport.insights.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2 text-xs text-muted-foreground print:text-gray-700">
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
        </div>
      )}

      {/* Tab 3: Market Salary Reports */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>Запит ринкової зарплати</CardTitle>
              <CardDescription>Отримайте інформацію про середні, мінімальные та максимальні зарплати за спеціалізаціями.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateMarketReport} className="grid sm:grid-cols-3 gap-4 items-end">
                <div className="grid gap-2">
                  <Label htmlFor="salaryPosInput">Спеціалізація / Посада</Label>
                  <Input
                    id="salaryPosInput"
                    placeholder="React Developer, QA Engineer..."
                    value={salaryPosition}
                    onChange={(e) => setSalaryPosition(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="salaryLocInput">Локація / Країна</Label>
                  <Input
                    id="salaryLocInput"
                    placeholder="Київ, Remote, etc."
                    value={salaryLocation}
                    onChange={(e) => setSalaryLocation(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={creatingReport || !salaryPosition}>
                  {creatingReport ? 'Аналіз...' : 'Створити звіт'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* List of existing reports */}
          <div className="grid gap-4 md:grid-cols-2">
            {salaryReports.data && salaryReports.data.length > 0 ? (
              salaryReports.data.map((report: SalaryReport) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 border-b border-white/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base font-semibold">{report.position}</CardTitle>
                        <CardDescription className="text-xs">Локація: {report.location || 'Всі регіони'}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        Джерело: {report.source}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/40 p-2 rounded border border-white/5">
                        <span className="block text-[9px] text-muted-foreground uppercase font-bold">Мінімум</span>
                        <span className="text-sm font-bold text-foreground">
                          ${report.minSalary.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-primary/10 border-primary/20 p-2 rounded border">
                        <span className="block text-[9px] text-primary/80 uppercase font-bold">Медіана</span>
                        <span className="text-sm font-bold text-primary">
                          ${report.avgSalary.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-muted/40 p-2 rounded border border-white/5">
                        <span className="block text-[9px] text-muted-foreground uppercase font-bold">Максимум</span>
                        <span className="text-sm font-bold text-foreground">
                          ${report.maxSalary.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t border-white/5">
                      <span>Створено: {new Date(report.createdAt).toLocaleDateString('uk-UA')}</span>
                      <span>Валюта: {report.currency}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-10 bg-muted/20 border border-dashed rounded-lg">
                <Typography tone="muted">Немає ринкових звітів. Скористайтеся формою вище для аналізу.</Typography>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
