import { Link, Outlet, useLocation, Navigate } from '@tanstack/react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/use-auth'
import { ErrorBoundary } from '@/components/error-boundary'

const navLinkClass = cn(
  buttonVariants({ variant: 'ghost', size: 'sm' }),
  'text-muted-foreground data-[status=active]:bg-secondary data-[status=active]:text-secondary-foreground data-[status=active]:hover:bg-secondary/80 data-[status=active]:hover:text-secondary-foreground'
)

const appNavItems = [
  { to: '/app', label: 'Дашборд' },
  { to: '/app/agents', label: 'Агенти' },
  { to: '/app/analytics', label: 'Аналітика' },
  { to: '/app/search', label: 'Пошук' },
  { to: '/app/vacancies', label: 'Вакансії' },
  { to: '/app/resumes', label: 'Резюме' },
  { to: '/app/matches', label: 'Матчі' },
  { to: '/app/tasks', label: 'Завдання' },
]

export function RootLayout() {
  const auth = useAuth()
  const location = useLocation()

  const isAppRoute = location.pathname.startsWith('/app')

  if (isAppRoute) {
    if (auth.isBootstrapping) {
      return (
        <div className="flex h-svh w-screen items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-2" />
        </div>
      )
    }
    if (!auth.isAuthenticated) {
      return <Navigate to="/" replace />
    }

    return (
      <main className="min-h-svh bg-background text-foreground">
        <header className="border-b bg-background/95 backdrop-blur print:hidden">
          <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center gap-3 px-5 py-3">
            <Typography asChild variant="h6">
              <Link to="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Typography variant="label" className="text-primary-foreground" style={{ fontWeight: 'bold' }}>
                    HR
                  </Typography>
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
                    Вийти
                  </Button>
                </>
              ) : (
                <Typography asChild variant="control" tone="muted">
                  <Link to="/" className={navLinkClass}>
                    Увійти
                  </Link>
                </Typography>
              )}
            </nav>
          </div>
        </header>
        <div className="mx-auto w-full max-w-7xl px-5 py-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    )
  }

  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  )
}
