import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface AgentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vacancy?: string
  candidates?: { id: string; name: string; match: number }[]
  resumes?: { id: string; name: string }[]
}

// Marta — AI Sourcer
export function MartaModal({ open, onOpenChange, vacancy }: AgentModalProps) {
  const [taskType, setTaskType] = useState<'search' | 'analysis' | 'outreach' | 'report'>('search')
  const [keywords, setKeywords] = useState('')
  const [location, setLocation] = useState('Київ, Україна')
  const [level, setLevel] = useState('Middle')
  const [sources, setSources] = useState({ workua: true, robota: true, linkedin: true, indeed: false })
  const [salaryFrom, setSalaryFrom] = useState('2000')
  const [salaryTo, setSalaryTo] = useState('4500')
  const [results, setResults] = useState<typeof mockResults | null>(null)

  const mockResults = [
    { name: 'Олексій Сидоренко', match: 92, skills: 'React, TS, Node.js', salary: '$3200', location: 'Київ', source: 'Work.ua' },
    { name: 'Марія Бондар', match: 88, skills: 'React, TS, GraphQL', salary: '$3800', location: 'Remote', source: 'LinkedIn' },
    { name: 'Дмитро Козлов', match: 81, skills: 'React, JS, REST', salary: '$2800', location: 'Львів', source: 'Robota.ua' },
  ]

  const handleExecute = () => {
    setResults(mockResults)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            Доручити задачу: Марта
          </DialogTitle>
          <DialogDescription>Сорсер (Sourcing Specialist)</DialogDescription>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Активна — зараз шукає кандидатів на {vacancy || 'React Developer'}</span>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Тип задачі:</Label>
            <div className="grid grid-cols-4 gap-2">
              {([['search', '🔍 Пошук кандидатів'], ['analysis', '📊 Аналіз ринку'], ['outreach', '📧 Outreach'], ['report', '📋 Звіт']] as const).map(([key, label]) => (
                <button key={key} type="button" onClick={() => setTaskType(key)}
                  className={cn('p-2 rounded-lg border text-xs text-center transition-all',
                    taskType === key ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border bg-background hover:bg-muted text-muted-foreground')}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="space-y-1.5">
              <Label>Ключові слова *</Label>
              <Input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="React Developer, TypeScript, Node.js" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Локація</Label>
                <Input value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Рівень</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Middle">Middle</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Джерела:</Label>
              <div className="flex gap-3">
                {Object.entries({ workua: 'Work.ua', robota: 'Robota.ua', linkedin: 'LinkedIn', indeed: 'Indeed' }).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-1.5 text-sm">
                    <input type="checkbox" checked={sources[key as keyof typeof sources]} onChange={e => setSources(prev => ({ ...prev, [key]: e.target.checked }))} className="rounded border-input" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>ЗП від</Label>
                <Input value={salaryFrom} onChange={e => setSalaryFrom(e.target.value)} type="number" />
              </div>
              <div className="space-y-1.5">
                <Label>ЗП до</Label>
                <Input value={salaryTo} onChange={e => setSalaryTo(e.target.value)} type="number" />
              </div>
            </div>
          </div>

          {results && (
            <div className="border-t pt-4 space-y-3">
              <Label className="text-xs text-muted-foreground">Результат виконання</Label>
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <p className="text-sm font-semibold">🤖 Результат: Марта знайшла 23 кандидатів</p>
                {results.map((r, i) => (
                  <div key={i} className="p-3 bg-background rounded-lg border space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">👤 {r.name} — {r.match}% матч</span>
                      <Badge variant={r.match >= 90 ? 'default' : r.match >= 80 ? 'secondary' : 'outline'}>{r.match}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.skills} · {r.salary} · {r.location} · {r.source}</p>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" className="text-xs h-6">💾 Зберегти</Button>
                      <Button size="sm" variant="outline" className="text-xs h-6">📧 Контакт</Button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Показано 3 з 23 <button className="text-primary underline">Показати всі →</button></p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Скасувати</Button>
            <Button onClick={handleExecute}>🚀 Виконати задачу</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Artur — AI Analyst
export function ArturModal({ open, onOpenChange }: AgentModalProps) {
  const [analysisType, setAnalysisType] = useState<'salary' | 'competitors' | 'trends' | 'comparison'>('salary')
  const [position, setPosition] = useState('Senior React Developer')
  const [location, setLocation] = useState('Київ, Україна')
  const [level, setLevel] = useState('Senior')
  const [ourOffer, setOurOffer] = useState('3500')
  const [showResult, setShowResult] = useState(false)

  const handleExecute = () => setShowResult(true)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
            Доручити задачу: Артур
          </DialogTitle>
          <DialogDescription>Аналітик ринку (Market Intelligence)</DialogDescription>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="size-2 rounded-full bg-muted-foreground" />
            <span className="text-xs text-muted-foreground">Очікує задачу</span>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Тип аналізу:</Label>
            <div className="grid grid-cols-4 gap-2">
              {([['salary', '💰 Аналіз зарплат'], ['competitors', '🏢 Аналіз конкурентів'], ['trends', '📈 Тренд ринку'], ['comparison', '🔄 Порівн. вакансій']] as const).map(([key, label]) => (
                <button key={key} type="button" onClick={() => setAnalysisType(key)}
                  className={cn('p-2 rounded-lg border text-xs text-center transition-all',
                    analysisType === key ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border bg-background hover:bg-muted text-muted-foreground')}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="space-y-1.5">
              <Label>Позиція *</Label>
              <Input value={position} onChange={e => setPosition(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Локація *</Label>
                <Input value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Рівень *</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Middle">Middle</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Наша пропозиція: $</Label>
              <Input value={ourOffer} onChange={e => setOurOffer(e.target.value)} type="number" />
            </div>
          </div>

          {showResult && (
            <div className="border-t pt-4 space-y-3">
              <Label className="text-xs text-muted-foreground">Результат</Label>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <p className="text-sm font-semibold">📊 Зарплатний аналіз: {position} — {location}</p>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-background rounded border"><span className="block font-bold text-base">$1800</span>Min</div>
                  <div className="p-2 bg-background rounded border"><span className="block font-bold text-base">$2600</span>P25</div>
                  <div className="p-2 bg-background rounded border"><span className="block font-bold text-base">$3200</span>Median</div>
                  <div className="p-2 bg-background rounded border"><span className="block font-bold text-base">$5500</span>Max</div>
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-end"><div className="w-8 h-3 bg-primary/30 rounded" /></div>
                  <div className="flex justify-end"><div className="w-16 h-3 bg-primary/50 rounded" /></div>
                  <div className="flex justify-end"><div className="w-24 h-3 bg-primary/70 rounded" /></div>
                  <div className="flex justify-end"><div className="w-32 h-3 bg-primary rounded" /></div>
                  <p className="text-muted-foreground pt-1">← Distribution</p>
                </div>
                <p className="text-sm">Ваша пропозиція ${ourOffer} — вище медіани на 9% ✅</p>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">💡 Рекомендації:</p>
                  <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
                    <li>Ринок зростає на 12% QoQ для Senior React</li>
                    <li>67% компаній пропонують remote/hybrid</li>
                    <li>Топ навички: React, TS, Next.js, Node.js, GraphQL</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Скасувати</Button>
            <Button onClick={handleExecute}>🚀 Виконати задачу</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Sofia — AI Screening
export function SofiaModal({ open, onOpenChange, vacancy, candidates }: AgentModalProps) {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [focusAreas, setFocusAreas] = useState({ skills: true, experience: true, salary: true, cultural: true, availability: true })
  const [showResult, setShowResult] = useState(false)

  const mockCandidates = candidates || [
    { id: '1', name: 'Іван Петренко', match: 92 },
    { id: '2', name: 'Марія Бондар', match: 88 },
    { id: '3', name: 'Дмитро Козлов', match: 81 },
    { id: '4', name: 'Олена Сидорчук', match: 65 },
  ]

  const toggleCandidate = (id: string) => {
    setSelectedCandidates(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  const handleExecute = () => setShowResult(true)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
            Доручити задачу: Софія
          </DialogTitle>
          <DialogDescription>Screening Specialist (Попередній скринінг)</DialogDescription>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Обробляє — аналізує {selectedCandidates.length} резюме</span>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label>Вакансія *</Label>
            <Select defaultValue="senior-react">
              <SelectTrigger><SelectValue placeholder="Оберіть вакансію" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="senior-react">{vacancy || 'Senior React Developer'} — TechCorp</SelectItem>
                <SelectItem value="qa">QA Engineer</SelectItem>
                <SelectItem value="frontend">Frontend Developer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Кандидати для скринінгу:</Label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto border rounded-lg p-2">
              {mockCandidates.map(c => (
                <label key={c.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer">
                  <input type="checkbox" checked={selectedCandidates.includes(c.id)} onChange={() => toggleCandidate(c.id)} className="rounded border-input" />
                  <span className="text-sm flex-1">{c.name}</span>
                  <Badge variant={c.match >= 80 ? 'default' : 'outline'} className="text-xs">{c.match}% матч</Badge>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Фокус скринінгу:</Label>
            <div className="flex flex-wrap gap-3">
              {Object.entries({ skills: 'Технічні навички', experience: 'Досвід', salary: 'ЗП expectations', cultural: 'Cultural fit', availability: 'Availability' }).map(([key, label]) => (
                <label key={key} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" checked={focusAreas[key as keyof typeof focusAreas]} onChange={e => setFocusAreas(prev => ({ ...prev, [key]: e.target.checked }))} className="rounded border-input" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {showResult && (
            <div className="border-t pt-4 space-y-3">
              <Label className="text-xs text-muted-foreground">Результат скринінгу</Label>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <p className="text-sm font-semibold">📋 Screening Report: Іван Петренко</p>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">✅ Технічні навички: 9/10</span><p className="text-xs text-muted-foreground">React, TypeScript, Node.js — підтверджено досвідом. GraphQL — не має, але вивчає</p></div>
                  <div><span className="font-medium">✅ Досвід: 5+ років — відповідає вимогам</span><p className="text-xs text-muted-foreground">TechCorp (2р), StartupXYZ (2р), Freelance (1р)</p></div>
                  <div><span className="font-medium">✅ ЗП очікування: $3500 — в межах бюджету</span></div>
                  <div><span className="font-medium">⚠️ Cultural fit: потребує перевірки</span><p className="text-xs text-muted-foreground">Працював переважно remote, офіс в Києві</p></div>
                  <div><span className="font-medium">✅ Availability: готовий через 2 тижні</span></div>
                </div>
                <div className="pt-2 border-t space-y-1">
                  <p className="text-sm font-semibold">🎯 Рекомендація: ✅ Рекомендовано до інтерв'ю</p>
                  <p className="text-xs font-semibold text-muted-foreground">❓ Питання для перевірки:</p>
                  <ol className="list-decimal pl-4 text-xs text-muted-foreground space-y-0.5">
                    <li>"Чи готові ви до офісної роботи 3 дні/тиждень?"</li>
                    <li>"Який ваш досвід роботи в команді 10+ осіб?"</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Скасувати</Button>
            <Button onClick={handleExecute} disabled={selectedCandidates.length === 0}>🚀 Виконати задачу</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Danylo — AI Interview Coordinator
export function DanyloModal({ open, onOpenChange, candidates }: AgentModalProps) {
  const [selectedCandidate, setSelectedCandidate] = useState('')
  const [interviewType, setInterviewType] = useState<'technical' | 'hr' | 'final'>('technical')
  const [date, setDate] = useState('2026-05-18')
  const [time, setTime] = useState('10:00')
  const [duration, setDuration] = useState('45')
  const [format, setFormat] = useState<'meet' | 'phone' | 'office'>('meet')
  const [interviewers, setInterviewers] = useState({ techLead: true, hr: true })
  const [focusAreas, setFocusAreas] = useState('React (Hooks, Performance, Patterns)\nTypeScript (Generics, Utility Types)\nSystem Design (Microservices, API)')
  const [showResult, setShowResult] = useState(false)

  const mockCandidates = candidates || [
    { id: '1', name: 'Іван Петренко — Senior React Dev' },
    { id: '2', name: 'Марія Бондар — Frontend Developer' },
  ]

  const handleExecute = () => setShowResult(true)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
            Доручити задачу: Данило
          </DialogTitle>
          <DialogDescription>Interview Coordinator (Координація інтерв'ю)</DialogDescription>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Активний — планує 3 інтерв'ю на цьому тижні</span>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label>Кандидат *</Label>
            <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
              <SelectTrigger><SelectValue placeholder="Оберіть кандидата" /></SelectTrigger>
              <SelectContent>
                {mockCandidates.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Тип інтерв'ю:</Label>
            <div className="flex gap-2">
              {([['technical', '🔵 Технічне'], ['hr', '🟢 HR скринінг'], ['final', '🟡 Фінальне']] as const).map(([key, label]) => (
                <button key={key} type="button" onClick={() => setInterviewType(key)}
                  className={cn('px-3 py-1.5 rounded-lg border text-xs transition-all',
                    interviewType === key ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border bg-background hover:bg-muted text-muted-foreground')}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Дата</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Час</Label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Тривалість</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 хв</SelectItem>
                  <SelectItem value="45">45 хв</SelectItem>
                  <SelectItem value="60">60 хв</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Формат:</Label>
            <div className="flex gap-2">
              {([['meet', '📹 Google Meet'], ['phone', '📞 Телефон'], ['office', '🏢 Офіс']] as const).map(([key, label]) => (
                <button key={key} type="button" onClick={() => setFormat(key)}
                  className={cn('px-3 py-1.5 rounded-lg border text-xs transition-all',
                    format === key ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border bg-background hover:bg-muted text-muted-foreground')}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Інтерв'юери:</Label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={interviewers.techLead} onChange={e => setInterviewers(prev => ({ ...prev, techLead: e.target.checked }))} className="rounded border-input" />
                Tech Lead (Андрій)
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={interviewers.hr} onChange={e => setInterviewers(prev => ({ ...prev, hr: e.target.checked }))} className="rounded border-input" />
                HR Manager (Марина)
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Фокус-areas:</Label>
            <textarea value={focusAreas} onChange={e => setFocusAreas(e.target.value)} className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>

          {showResult && (
            <div className="border-t pt-4 space-y-3">
              <Label className="text-xs text-muted-foreground">Результат</Label>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                <p>✅ Інтерв'ю заплановано на {date} о {time}</p>
                <p>📹 Google Meet link: meet.google.com/xxx-xxxx-xxx</p>
                <p>📧 Інвайти надіслані: кандидату + інтерв'юерам</p>
                <p>📅 Додано в Google Calendar</p>
                <p>⏰ Нагадування: за 15 хв</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Скасувати</Button>
            <Button onClick={handleExecute}>🚀 Виконати задачу</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Maksym — AI Offer Manager
export function MaksymModal({ open, onOpenChange, candidates }: AgentModalProps) {
  const [selectedCandidate, setSelectedCandidate] = useState('')
  const [salary, setSalary] = useState('3500')
  const [bonus, setBonus] = useState('10')
  const [startDate, setStartDate] = useState('2026-06-01')
  const [probation, setProbation] = useState('3')
  const [workFormat, setWorkFormat] = useState('hybrid')
  const [vacation, setVacation] = useState('20')
  const [benefits, setBenefits] = useState({ learning: true, medical: true, sport: false, equipment: true })
  const [showPreview, setShowPreview] = useState(false)

  const mockCandidates = candidates || [
    { id: '1', name: 'Іван Петренко — Senior React Dev' },
    { id: '2', name: 'Марія Бондар — Frontend Developer' },
  ]

  const handlePreview = () => setShowPreview(true)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            Доручити задачу: Максим
          </DialogTitle>
          <DialogDescription>Offer Manager (Управління оферами)</DialogDescription>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="size-2 rounded-full bg-muted-foreground" />
            <span className="text-xs text-muted-foreground">Очікує задачу</span>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label>Кандидат *</Label>
            <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
              <SelectTrigger><SelectValue placeholder="Оберіть кандидата" /></SelectTrigger>
              <SelectContent>
                {mockCandidates.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div>Позиція: <span className="text-foreground font-medium">Senior React Developer</span></div>
            <div>Компанія: <span className="text-foreground font-medium">TechCorp</span></div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Офер деталі:</p>
            <div className="space-y-1.5">
              <Label>ЗП ($ / місяць)</Label>
              <Input value={salary} onChange={e => setSalary(e.target.value)} type="number" />
            </div>
            <div className="space-y-1.5">
              <Label>Бонус (% від річної ЗП)</Label>
              <Input value={bonus} onChange={e => setBonus(e.target.value)} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Дата старту</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Probation (місяці)</Label>
                <Select value={probation} onValueChange={setProbation}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 місяць</SelectItem>
                    <SelectItem value="3">3 місяці</SelectItem>
                    <SelectItem value="6">6 місяців</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Формат</Label>
                <Select value={workFormat} onValueChange={setWorkFormat}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid — 3 дні офіс</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Відпустка (днів)</Label>
                <Select value={vacation} onValueChange={setVacation}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14">14 днів</SelectItem>
                    <SelectItem value="20">20 днів</SelectItem>
                    <SelectItem value="24">24 дні</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Додаткові benefits:</Label>
            <div className="flex flex-wrap gap-3">
              {Object.entries({ learning: 'Компенсація навчання', medical: 'Медична страховка', sport: 'Sport/Wellness', equipment: 'Equipment budget' }).map(([key, label]) => (
                <label key={key} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" checked={benefits[key as keyof typeof benefits]} onChange={e => setBenefits(prev => ({ ...prev, [key]: e.target.checked }))} className="rounded border-input" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {showPreview && (
            <div className="border-t pt-4 space-y-3">
              <Label className="text-xs text-muted-foreground">Preview офера</Label>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <p className="text-sm font-semibold">📄 Job Offer — Senior React Developer</p>
                <div className="space-y-2 text-sm">
                  <p>Шановний Іване,</p>
                  <p>Ми раді запропонувати вам позицію Senior React Developer у TechCorp.</p>
                  <div className="space-y-1 text-muted-foreground">
                    <p>💰 Компенсація: ${Number(salary).toLocaleString()}/міс + {bonus}% річний бонус</p>
                    <p>📅 Старт: {new Date(startDate).toLocaleDateString('uk-UA')}</p>
                    <p>🏢 Формат: {workFormat === 'hybrid' ? 'Hybrid (3 дні офіс, Київ)' : workFormat === 'remote' ? 'Remote' : 'Office'}</p>
                    <p>🏖️ Відпустка: {vacation} днів + державні свята</p>
                    {benefits.learning && <p>📚 Навчання: $1,000/рік</p>}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm">📧 Надіслати кандидату</Button>
                  <Button size="sm" variant="outline">📥 Завантажити PDF</Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Скасувати</Button>
            <Button onClick={handlePreview}>📄 Preview офера</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Olena — AI Reports
export function OlenaModal({ open, onOpenChange }: AgentModalProps) {
  const [reportType, setReportType] = useState<'weekly' | 'kpi' | 'salary' | 'pipeline'>('weekly')
  const [dateFrom, setDateFrom] = useState('2026-05-12')
  const [dateTo, setDateTo] = useState('2026-05-18')
  const [include, setInclude] = useState({ vacancies: true, resumes: true, matches: true, interviews: true, offers: true, salaryChanges: true, aiInsights: true, comparison: true })
  const [showResult, setShowResult] = useState(false)

  const handleGenerate = () => setShowResult(true)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
            Доручити задачу: Олена
          </DialogTitle>
          <DialogDescription>Reports & Analytics (Звітність)</DialogDescription>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Активна — готує щотижневий звіт</span>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Тип звіту:</Label>
            <div className="grid grid-cols-4 gap-2">
              {([['weekly', '📊 Щотижн. звіт'], ['kpi', '📈 KPI рекрутинг'], ['salary', '💰 Зарплат. аналіз'], ['pipeline', '📋 Pipeline звіт']] as const).map(([key, label]) => (
                <button key={key} type="button" onClick={() => setReportType(key)}
                  className={cn('p-2 rounded-lg border text-xs text-center transition-all',
                    reportType === key ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border bg-background hover:bg-muted text-muted-foreground')}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Період від</Label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Період до</Label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Включити:</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries({ vacancies: 'Нові вакансії', resumes: 'Нові резюме', matches: 'Матчі', interviews: "Інтерв'ю", offers: 'Офери', salaryChanges: 'Зарплатні зміни', aiInsights: 'AI рекомендації', comparison: 'Порівняння з попереднім' }).map(([key, label]) => (
                <label key={key} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" checked={include[key as keyof typeof include]} onChange={e => setInclude(prev => ({ ...prev, [key]: e.target.checked }))} className="rounded border-input" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {showResult && (
            <div className="border-t pt-4 space-y-3">
              <Label className="text-xs text-muted-foreground">Результат</Label>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <p className="text-sm font-semibold">📊 Weekly Recruitment Report</p>
                <p className="text-xs text-muted-foreground">{new Date(dateFrom).toLocaleDateString('uk-UA')} — {new Date(dateTo).toLocaleDateString('uk-UA')}</p>

                <div className="space-y-2">
                  <p className="text-xs font-semibold">📈 Ключові метрики:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Нові вакансії: +3 (всього 24)</li>
                    <li>• Нові резюме: +12 (всього 156)</li>
                    <li>• Нові матчі: +8 (всього 89)</li>
                    <li>• Інтерв'ю проведено: 5</li>
                    <li>• Офери надіслані: 2</li>
                    <li>• Найнято: 1</li>
                  </ul>
                </div>

                <div className="pt-2 border-t space-y-1 text-sm">
                  <p>🎯 Conversion: 156 резюме → 12 hired (7.7%)</p>
                  <p>⏱️ Avg time-to-fill: 14 днів</p>
                  <p>💰 Avg salary offered: $3,100</p>
                </div>

                <div className="pt-2 border-t space-y-1">
                  <p className="text-xs font-semibold">💡 AI Insights:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• React Dev ринок зростає — збільште ЗП на 10%</li>
                    <li>• LinkedIn дає 25% якісніших кандидатів</li>
                    <li>• Середній час закриття зменшився на 2 дні</li>
                  </ul>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">📥 PDF</Button>
                  <Button size="sm" variant="outline">📊 CSV</Button>
                  <Button size="sm">📧 Надіслати керівнику</Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Скасувати</Button>
            <Button onClick={handleGenerate}>🚀 Генерувати звіт</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
