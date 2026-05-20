import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6">
      <div className="text-center max-w-md space-y-6">
        <Typography variant="h1" className="text-[120px] font-bold text-muted/30 leading-none">404</Typography>
        <div className="flex justify-center">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-muted/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="M8 8 14 14" /><path d="M14 8 8 14" /></svg>
          </div>
        </div>
        <div className="space-y-2">
          <Typography variant="h2">Сторінку не знайдено</Typography>
          <Typography tone="muted">Сторінка, яку ви шукаєте, не існує або була переміщена.</Typography>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => navigate({ to: '/app' })}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            На головну
          </Button>
          <Button variant="outline" onClick={() => navigate({ to: '/app/search' })}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            Пошук
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ServerErrorPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6">
      <div className="text-center max-w-md space-y-6">
        <Typography variant="h1" className="text-[120px] font-bold text-muted/30 leading-none">500</Typography>
        <div className="flex justify-center">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-muted/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60"><path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" /><path d="M12 18v4" /><path d="m4.9 19.1 2.9-2.9" /><path d="M2 12h4" /><path d="m4.9 4.9 2.9 2.9" /></svg>
          </div>
        </div>
        <div className="space-y-2">
          <Typography variant="h2">Щось пішло не так</Typography>
          <Typography tone="muted">Ми працюємо над виправленням. Спробуйте оновити сторінку.</Typography>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => window.location.reload()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
            Оновити
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/app'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            На головну
          </Button>
        </div>
      </div>
    </div>
  )
}

export function NoConnectionPage() {
  const [retrying, setRetrying] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleRetry = () => {
    setRetrying(true)
    setCountdown(5)
    setTimeout(() => {
      setRetrying(false)
      window.location.reload()
    }, 5000)
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6">
      <div className="text-center max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-muted/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60"><path d="M12 20h.01" /><path d="M8.5 16.43a6 6 0 0 1 .07-8.46" /><path d="M15.5 7.97a6 6 0 0 1 0 8.49" /><path d="M5.64 13.36a10 10 0 0 1 .07-10.72" /><path d="M18.36 10.63a10 10 0 0 1 0 10.73" /></svg>
          </div>
        </div>
        <div className="space-y-2">
          <Typography variant="h2">Немає з'єднання</Typography>
          <Typography tone="muted">Перевірте підключення до інтернету та спробуйте знову.</Typography>
        </div>
        <Button onClick={handleRetry} disabled={retrying}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('mr-1.5', retrying && 'animate-spin')}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
          {retrying ? `Спроба через ${countdown}с...` : 'Спробувати знову'}
        </Button>
      </div>
    </div>
  )
}
