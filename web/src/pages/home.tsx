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
      <div className="min-h-screen w-full bg-surface text-on-surface font-body text-body antialiased flex items-center justify-center relative overflow-x-hidden p-md lg:p-xl">
        <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary-fixed opacity-30 blur-[100px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-secondary-fixed opacity-30 blur-[80px] pointer-events-none" />
        <Card className="w-fit z-10 bg-surface-container-lowest/80 backdrop-blur-md border-outline-variant shadow-lg">
          <CardContent className="flex items-center gap-3 p-md">
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
      <div className="min-h-screen w-full bg-surface text-on-surface antialiased flex items-center justify-center relative overflow-x-hidden p-md lg:p-xl">
        <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary-fixed opacity-30 blur-[100px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-secondary-fixed opacity-30 blur-[80px] pointer-events-none" />
        
        <section className="w-full max-w-[500px] flex flex-col items-center text-center gap-lg px-xl py-2xl z-10 bg-surface-container-lowest/80 backdrop-blur-md rounded-[28px] border border-outline-variant shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1)]">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-sm">
            <Typography as="span" className="material-symbols-outlined select-none" style={{ fontVariationSettings: "'FILL' 1", fontSize: '36px' }}>
              verified_user
            </Typography>
          </div>

          <div className="flex flex-col gap-sm items-center w-full">
            <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 text-primary px-3 py-1 rounded-full">
              Авторизований
            </Badge>
            <Typography variant="h2" className="text-on-surface mt-sm">
              Сесія активна
            </Typography>
            <Typography variant="body" tone="muted" className="mt-xs w-full break-words">
              Ви увійшли як{' '}
              <Typography as="strong" variant="emphasis" tone="default" className="text-primary break-all" style={{ fontWeight: 600 }}>
                {auth.user.email}
              </Typography>
              .<br />Ласкаво просимо до HR Recruiter.
            </Typography>
          </div>

          <Button asChild size="lg" className="w-full sm:w-auto px-xl py-md bg-primary text-on-primary hover:bg-on-primary-fixed-variant transition-all duration-300 rounded-xl shadow-md cursor-pointer mt-md">
            <Link to="/app">Відкрити дашборд</Link>
          </Button>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-surface text-on-surface antialiased flex items-center justify-center relative overflow-x-hidden p-md lg:p-xl">
      {/* Decorative background elements */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary-fixed opacity-30 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-secondary-fixed opacity-30 blur-[80px] pointer-events-none" />

      <main className="w-full max-w-[1280px] grid grid-cols-1 lg:grid-cols-12 gap-xl lg:gap-[64px] items-center relative z-10">
        {/* Left Column (60% on desktop) */}
        <div className="lg:col-span-7 flex flex-col items-start">
          {/* Badge */}
          <div className="inline-flex items-center gap-sm px-md py-sm bg-primary-container text-on-primary-container rounded-full mb-lg shadow-sm">
            <Typography
              as="span"
              className="material-symbols-outlined hero-badge-icon select-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              colors_spark
            </Typography>
            <Typography
              as="span"
              variant="label"
              className="uppercase hero-badge-text"
            >
              HR Recruiter
            </Typography>
          </div>

          {/* Headline */}
          <Typography
            as="h1"
            className="hero-title text-on-surface mb-md"
          >
            Розумний рекрутинг з{' '}
            <Typography as="span" className="text-primary hero-title">
              AI-асистентом
            </Typography>
          </Typography>

          {/* Description */}
          <Typography
            as="p"
            className="text-on-surface-variant max-w-[600px] mb-xl hero-desc"
          >
            Оптимізуйте процес найму, знаходьте найкращих кандидатів швидше та приймайте рішення на основі даних за допомогою нашої передової платформи.
          </Typography>

          {/* CTA */}
          <Typography
            asChild
            variant="h4"
          >
            <button
              onClick={() => {
                const element = document.getElementById('auth-form-container')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                  const input = element.querySelector('input')
                  if (input) input.focus()
                }
              }}
              className="inline-block bg-primary text-on-primary px-[32px] py-[16px] rounded-lg shadow-[0_4px_6px_-1px_rgba(15,23,42,0.1)] hover:bg-on-primary-fixed-variant hover:shadow-[0_10px_15px_-3px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 transition-all duration-300 mb-[48px] cursor-pointer"
            >
              Почати роботу
            </button>
          </Typography>

          {/* Feature Grid (Bento style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md w-full max-w-[600px]">
            {/* Feature 1 */}
            <div className="group bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] hover:shadow-[0_4px_6px_-1px_rgba(15,23,42,0.1)] hover:border-primary transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-md group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <Typography as="span" className="material-symbols-outlined select-none">
                  neurology
                </Typography>
              </div>
              <Typography as="h3" variant="h4" className="text-on-surface mb-xs">
                AI-матчинг
              </Typography>
              <Typography as="p" variant="bodySm" className="text-on-surface-variant">
                Точний підбір кандидатів на основі навичок та досвіду.
              </Typography>
            </div>

            {/* Feature 2 */}
            <div className="group bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] hover:shadow-[0_4px_6px_-1px_rgba(15,23,42,0.1)] hover:border-primary transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-md group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                <Typography as="span" className="material-symbols-outlined select-none">
                  search
                </Typography>
              </div>
              <Typography as="h3" variant="h4" className="text-on-surface mb-xs">
                Пошук резюме
              </Typography>
              <Typography as="p" variant="bodySm" className="text-on-surface-variant">
                Інтелектуальний семантичний пошук по базі даних.
              </Typography>
            </div>

            {/* Feature 3 */}
            <div className="group bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] hover:shadow-[0_4px_6px_-1px_rgba(15,23,42,0.1)] hover:border-primary transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-tertiary mb-md group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors">
                <Typography as="span" className="material-symbols-outlined select-none">
                  bar_chart
                </Typography>
              </div>
              <Typography as="h3" variant="h4" className="text-on-surface mb-xs">
                Аналітика
              </Typography>
              <Typography as="p" variant="bodySm" className="text-on-surface-variant">
                Детальні звіти по воронці найму та ефективності.
              </Typography>
            </div>

            {/* Feature 4 */}
            <div className="group bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] hover:shadow-[0_4px_6px_-1px_rgba(15,23,42,0.1)] hover:border-primary transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface mb-md group-hover:bg-on-surface group-hover:text-surface-container-lowest transition-colors">
                <Typography as="span" className="material-symbols-outlined select-none">
                  calendar_today
                </Typography>
              </div>
              <Typography as="h3" variant="h4" className="text-on-surface mb-xs">
                Google інтеграції
              </Typography>
              <Typography as="p" variant="bodySm" className="text-on-surface-variant">
                Синхронізація подій та зустрічей у реальному часі.
              </Typography>
            </div>
          </div>
        </div>

        {/* Right Column (40% on desktop) */}
        <div id="auth-form-container" className="lg:col-span-5 w-full max-w-[480px] mx-auto lg:mx-0">
          <AuthForm />
        </div>
      </main>
    </div>
  )
}
