import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const [vacancyForm, setVacancyForm] = useState({ title: '', location: 'Київ', salaryFrom: '3000', salaryTo: '4500', description: '' })
  const navigate = useNavigate()

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
    else {
      onComplete()
      navigate({ to: '/app' })
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-background flex items-center justify-center">
      <div className="w-full max-w-lg px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-sm text-muted-foreground">{step} / 3</span>
          {step < 3 && (
            <button onClick={() => { onComplete(); navigate({ to: '/app' }) }} className="text-sm text-muted-foreground hover:text-foreground">
              Skip
            </button>
          )}
        </div>

        {/* Step 1: AI Team Intro */}
        {step === 1 && (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="flex size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white text-2xl font-bold">
                AI HR Team
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Зустрічайте вашу AI HR команду</h2>
              <p className="text-muted-foreground">6 AI-агентів допоможуть автоматизувати:</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['🔍', 'Сорсинг кандидатів'], ['📊', 'Аналітика ринку'], ['✅', 'Скринінг резюме'], ['📅', 'Координація інтерв\'ю'], ['📄', 'Управління оферами'], ['📈', 'Звітність']].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
                  <span className="text-lg">{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <Button onClick={handleNext} className="w-full">Продовжити →</Button>
          </div>
        )}

        {/* Step 2: First Vacancy */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-4xl">💼</span>
              <h2 className="text-2xl font-bold">Створіть першу вакансію</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Назва позиції *</Label>
                <Input value={vacancyForm.title} onChange={e => setVacancyForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Senior React Developer" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Локація</Label>
                  <Input value={vacancyForm.location} onChange={e => setVacancyForm(prev => ({ ...prev, location: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>ЗП від ($)</Label>
                  <Input value={vacancyForm.salaryFrom} onChange={e => setVacancyForm(prev => ({ ...prev, salaryFrom: e.target.value }))} type="number" />
                </div>
                <div className="space-y-1.5">
                  <Label>ЗП до ($)</Label>
                  <Input value={vacancyForm.salaryTo} onChange={e => setVacancyForm(prev => ({ ...prev, salaryTo: e.target.value }))} type="number" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Опис вакансії *</Label>
                <Textarea value={vacancyForm.description} onChange={e => setVacancyForm(prev => ({ ...prev, description: e.target.value }))} placeholder="3+ років React, TypeScript, Node.js..." className="min-h-[100px]" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleNext} className="flex-1">Продовжити →</Button>
              <Button variant="outline" className="flex-1">🤖 AI Генерація опису</Button>
            </div>
          </div>
        )}

        {/* Step 3: First Match */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-4xl">🎯</span>
              <h2 className="text-2xl font-bold">Матч!</h2>
              <p className="text-muted-foreground">AI знайшла першого кандидата!</p>
            </div>
            <div className="rounded-xl border p-5 space-y-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">👤 Іван Петренко — Senior React Developer</p>
                  <p className="text-sm text-muted-foreground mt-1">React, TS, Node.js · $3500 · Київ · 5 років досвіду</p>
                </div>
                <Badge className="bg-emerald-500 text-white">🟢 94% матч</Badge>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm">👁️ Переглянути профіль</Button>
                <Button size="sm">📧 Надіслати інвайт</Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">🤖 AI також знайшла ще 5 кандидатів</p>
            <Button onClick={handleNext} className="w-full">🚀 Перейти до дашборду</Button>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[1, 2, 3].map(i => (
            <span key={i} className={cn('size-2 rounded-full transition-colors', i <= step ? 'bg-primary' : 'bg-muted')} />
          ))}
        </div>
      </div>
    </div>
  )
}
