import { Link } from '@tanstack/react-router'
import { AuthForm } from '@/components/AuthForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { useAuth } from '@/lib/use-auth'

const features = [
  {
    title: 'AI-матчинг',
    description: 'Точний підбір кандидатів на основі навичок та досвіду.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
        <path d="M12 2a10 10 0 0 1 10 10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    hoverBg: 'group-hover:bg-indigo-600 group-hover:text-white',
  },
  {
    title: 'Пошук резюме',
    description: 'Інтелектуальний пошук по Work.ua, Robota.ua, LinkedIn.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    hoverBg: 'group-hover:bg-emerald-600 group-hover:text-white',
  },
  {
    title: 'Аналітика',
    description: 'Детальні звіти по воронці найму та ефективності.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    hoverBg: 'group-hover:bg-amber-600 group-hover:text-white',
  },
  {
    title: 'Google інтеграції',
    description: 'Calendar, Sheets, Gmail — синхронізація в реальному часі.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
    color: 'text-zinc-600 dark:text-zinc-400',
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    hoverBg: 'group-hover:bg-zinc-800 group-hover:text-white dark:group-hover:bg-zinc-200 dark:group-hover:text-zinc-900',
  },
]

export function HomePage() {
  const auth = useAuth()

  if (auth.isBootstrapping) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Card className="w-fit">
          <CardContent className="flex items-center gap-3 p-6">
            <Spinner />
            <Typography variant="bodySm" tone="muted">
              Перевірка сесії...
            </Typography>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (auth.user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
              Авторизований
            </Badge>
            <div className="text-center space-y-2">
              <Typography variant="h2">Сесія активна</Typography>
              <Typography tone="muted">
                Ви увійшли як{' '}
                <Typography as="strong" variant="emphasis" className="text-primary">
                  {auth.user.email}
                </Typography>
              </Typography>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link to="/app">Відкрити дашборд</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto flex min-h-svh max-w-7xl flex-col lg:flex-row lg:items-center lg:gap-16 px-4 py-12 lg:px-8 lg:py-16">
        {/* Left Column */}
        <div className="flex-1 space-y-8">
          <Badge variant="outline" className="w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            HR Recruiter
          </Badge>

          <div className="space-y-4">
            <Typography variant="h1" className="text-4xl font-bold tracking-tight lg:text-5xl">
              Розумний рекрутинг з{' '}
              <span className="text-primary">AI-асистентом</span>
            </Typography>
            <Typography className="max-w-xl text-lg text-muted-foreground">
              Автоматизація підбору персоналу: пошук вакансій та резюме, AI-матчинг, інтеграція з Google Calendar, Sheets та Gmail, щоденні зведення.
            </Typography>
          </div>

          <Button asChild size="lg">
            <Link to="/app">Почати роботу</Link>
          </Button>

          {/* Feature Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
              >
                <div className={`mb-3 flex size-10 items-center justify-center rounded-lg ${feature.bg} ${feature.color} ${feature.hoverBg} transition-colors`}>
                  {feature.icon}
                </div>
                <Typography variant="h4" className="mb-1">{feature.title}</Typography>
                <Typography variant="bodySm" tone="muted">{feature.description}</Typography>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column — Auth Form */}
        <div className="mt-12 w-full max-w-md lg:mt-0 lg:shrink-0">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}
