import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, Navigate, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/use-auth'
import { ErrorBoundary } from '@/components/error-boundary'
import { Sidebar } from '@/components/sidebar'
import { CommandPalette } from '@/components/command-palette'
import { NotificationDropdown, UserDropdown } from '@/components/topbar-dropdowns'
import { Toaster } from '@/components/ui/toaster'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AIChatWidget } from '@/components/ai-chat-widget'
import { OnboardingFlow } from '@/components/onboarding'
import { cn } from '@/lib/utils'

export function RootLayout() {
  const auth = useAuth()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('hr-onboarding-complete')
    }
    return false
  })
  const navigate = useNavigate()

  useEffect(() => {
    let gPressed = false
    let gTimeout: ReturnType<typeof setTimeout>

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
        return
      }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setShortcutsOpen(prev => !prev)
        return
      }
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
        gPressed = true
        gTimeout = setTimeout(() => { gPressed = false }, 1000)
        return
      }
      if (gPressed && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        gPressed = false
        clearTimeout(gTimeout)
        const routes: Record<string, string> = { d: '/app', v: '/app/vacancies', c: '/app/resumes', m: '/app/matches', t: '/app/tasks', a: '/app/analytics', e: '/app/email' }
        if (routes[e.key]) navigate({ to: routes[e.key] })
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => { document.removeEventListener('keydown', handleKeyDown); clearTimeout(gTimeout) }
  }, [navigate])

  const isAppRoute = location.pathname.startsWith('/app')

    if (isAppRoute) {
    if (showOnboarding) {
      return <OnboardingFlow onComplete={() => { setShowOnboarding(false); localStorage.setItem('hr-onboarding-complete', '1') }} />
    }
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
      <div className="min-h-svh bg-background text-foreground">
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={() => void auth.logout()}
        />

        {/* Main content area */}
        <div
          className={cn(
            'flex min-h-svh flex-col transition-all duration-300',
            sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
          )}
        >
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur print:hidden">
            <h2 className="text-base font-semibold text-foreground">
              {location.pathname === '/app' && 'Дашборд'}
              {location.pathname === '/app/analytics' && 'Аналітика'}
              {location.pathname === '/app/search' && 'Пошук'}
              {location.pathname === '/app/vacancies' && 'Вакансії'}
              {location.pathname === '/app/resumes' && 'Резюме'}
              {location.pathname === '/app/matches' && 'Матчі'}
              {location.pathname === '/app/tasks' && 'Завдання'}
              {location.pathname === '/app/agents' && 'Агенти'}
              {location.pathname === '/app/email' && 'Email'}
              {location.pathname === '/app/settings' && 'Налаштування'}
            </h2>

            <div className="ml-auto flex items-center gap-3">
              <NotificationDropdown />
              <UserDropdown email={auth.user?.email} onLogout={() => void auth.logout()} />
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 text-muted-foreground" onClick={() => setCommandPaletteOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                <span className="text-xs">Пошук...</span>
                <kbd className="h-4 items-center rounded border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" x2="3" y1="12" y2="12" />
                  </svg>
                  На головну
                </Link>
              </Button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-6">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
        <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
        <Toaster />
        <AIChatWidget />

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-background/95 backdrop-blur sm:hidden print:hidden">
          {[
            { to: '/app', label: 'Дашборд', icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg> },
            { to: '/app/vacancies', label: 'Вакансії', icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> },
            { to: '/app/resumes', label: 'Резюме', icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg> },
            { to: '/app/matches', label: 'Матчі', icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8" /><path d="M3 16.2V21m0 0h4.8M3 21l6-6" /><path d="M21 7.8V3m0 0h-4.8M21 3l-6 6" /><path d="M3 7.8V3m0 0h4.8M3 3l6 6" /></svg> },
            { to: '/app/tasks', label: 'Завдання', icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h10" /><path d="M6 12h12" /><path d="M4 18h16" /><path d="m9 6 1 1" /><path d="m7 12 2 2" /><path d="m5 18 3 3" /></svg> },
          ].map(item => {
            const isActive = location.pathname === item.to
            return (
              <Link key={item.to} to={item.to} className={cn('flex flex-col items-center justify-center gap-0.5 py-1 px-3 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground')}>
                <span className={cn('transition-colors', isActive && '[&>svg]:stroke-[2.5]')}>{item.icon}</span>
                <span className="text-[10px]">{item.label}</span>
                {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary" />}
              </Link>
            )
          })}
        </nav>

        {/* Keyboard Shortcuts Modal */}
        <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="M6 8h.001" /><path d="M10 8h.001" /><path d="M14 8h.001" /><path d="M18 8h.001" /><path d="M6 12h.001" /><path d="M10 12h.001" /><path d="M14 12h.001" /><path d="M18 12h.001" /><path d="M7 16h10" /></svg>
                Keyboard Shortcuts
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold mb-2 text-muted-foreground text-xs uppercase">Навігація</p>
                <div className="space-y-1.5">
                  {[['⌘+K', 'Command Palette'], ['?', 'Ця модалка'], ['G + D', 'Дашборд'], ['G + V', 'Вакансії'], ['G + C', 'Резюме'], ['G + M', 'Матчі'], ['G + T', 'Завдання'], ['G + A', 'Аналітика'], ['G + E', 'Email']].map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between"><span>{label}</span><kbd className="h-5 min-w-[50px] inline-flex items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px]">{key}</kbd></div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold mb-2 text-muted-foreground text-xs uppercase">Дії</p>
                <div className="space-y-1.5">
                  {[['⌘+N', 'Нова вакансія'], ['⌘⇧+N', 'Нове завдання'], ['⌘+E', 'Швидкий пошук'], ['Esc', 'Закрити модалку']].map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between"><span>{label}</span><kbd className="h-5 min-w-[50px] inline-flex items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px]">{key}</kbd></div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  )
}
