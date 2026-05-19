import { Link } from '@tanstack/react-router'
import { AuthForm } from '@/components/AuthForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { useAuth } from '@/lib/use-auth'

export function HomePage() {
  const auth = useAuth()

  if (auth.isBootstrapping) {
    return (
      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <Card className="w-fit">
          <CardContent className="flex items-center gap-3">
            <Spinner />
            <Typography variant="bodySm" tone="muted">
              Перевірка сесії...
            </Typography>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (auth.user) {
    return (
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-16">
        <Badge variant="outline" className="w-fit">
          Авторизований
        </Badge>
        <div className="grid max-w-3xl gap-4">
          <Typography variant="h1">Сесія активна</Typography>
          <Typography className="max-w-2xl" tone="muted">
            Ви увійшли як{' '}
            <Typography as="strong" variant="emphasis" tone="default">
              {auth.user.email}
            </Typography>
            . Ласкаво просимо до HR Recruiter.
          </Typography>
        </div>
        <Button asChild size="lg" className="w-fit">
          <Link to="/app">Відкрити дашборд</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
      <div className="grid gap-5">
        <Badge variant="outline" className="w-fit">
          HR Recruiter
        </Badge>
        <Typography className="max-w-3xl" variant="h1">
          Розумний рекрутинг з AI-асистентом
        </Typography>
        <Typography className="max-w-2xl" tone="muted">
          Автоматизація підбору персоналу: пошук вакансій та резюме, AI-матчинг, 
          інтеграція з Google Calendar, Sheets та Gmail, щоденні зведення.
        </Typography>
        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link to="/app">Почати роботу</Link>
          </Button>
        </div>
      </div>
      <AuthForm />
    </section>
  )
}
