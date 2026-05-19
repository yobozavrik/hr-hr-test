import { Link, Outlet } from '@tanstack/react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/use-auth'

const navLinkClass = cn(
  buttonVariants({ variant: 'ghost', size: 'sm' }),
  'text-muted-foreground data-[status=active]:bg-secondary data-[status=active]:text-secondary-foreground data-[status=active]:hover:bg-secondary/80 data-[status=active]:hover:text-secondary-foreground'
)

const appNavItems = [
  { to: '/app', label: 'Дашборд' },
  { to: '/app/vacancies', label: 'Вакансии' },
  { to: '/app/resumes', label: 'Резюме' },
  { to: '/app/matches', label: 'Матчи' },
  { to: '/app/tasks', label: 'Задачи' },
  { to: '/app/integrations', label: 'Интеграции' },
]

export function RootLayout() {
  const auth = useAuth()

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center gap-3 px-5 py-3">
          <Typography asChild variant="h6">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">HR</span>
              </div>
              HR Recruiter
            </Link>
          </Typography>
          <nav className="ml-auto flex items-center gap-2" aria-label="Primary">
            {auth.isAuthenticated ? (
              <>
                {appNavItems.map((item) => (
                  <Typography key={item.to} asChild variant="control" tone="muted">
                    <Link to={item.to} className={navLinkClass}>
                      {item.label}
                    </Link>
                  </Typography>
                ))}
                <Separator orientation="vertical" className="h-6" />
                <Button type="button" variant="outline" size="sm" onClick={() => void auth.logout()}>
                  Выйти
                </Button>
              </>
            ) : (
              <Typography asChild variant="control" tone="muted">
                <Link to="/" className={navLinkClass}>
                  Войти
                </Link>
              </Typography>
            )}
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-5 py-6">
        <Outlet />
      </div>
    </main>
  )
}
