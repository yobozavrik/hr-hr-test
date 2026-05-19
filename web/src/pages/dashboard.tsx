import { useAuth } from '@/lib/use-auth'
import { useDailyDigest, useVacancies, useResumes, useUpcomingTasks, useMatches } from '@/hooks/use-hr'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

export function DashboardPage() {
  const auth = useAuth()
  const digest = useDailyDigest()
  const vacancies = useVacancies()
  const resumes = useResumes()
  const tasks = useUpcomingTasks()
  const matches = useMatches()

  const isLoading = digest.isLoading || vacancies.isLoading || resumes.isLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    )
  }

  const stats = [
    { label: 'Вакансій', value: vacancies.data?.length ?? 0, path: '/app/vacancies', color: 'bg-blue-500' },
    { label: 'Резюме', value: resumes.data?.length ?? 0, path: '/app/resumes', color: 'bg-green-500' },
    { label: 'Матчів', value: matches.data?.length ?? 0, path: '/app/matches', color: 'bg-purple-500' },
    { label: 'Завдань сьогодні', value: tasks.data?.length ?? 0, path: '/app/tasks', color: 'bg-orange-500' },
  ]

  return (
    <div className="grid gap-6">
      <div>
        <Typography variant="h2">Привіт, {auth.user?.displayName || auth.user?.email}!</Typography>
        <Typography tone="muted">Ваша HR-панель керування</Typography>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>{stat.label}</CardDescription>
                <div className={`h-2 w-2 rounded-full ${stat.color}`} />
              </div>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" size="sm">
                <Link to={stat.path}>Детальніше</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily Digest */}
      {digest.data && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Щоденне зведення</CardTitle>
                <CardDescription>Нове за останні 24 години</CardDescription>
              </div>
              <Badge variant="secondary">{new Date(digest.data.date).toLocaleDateString('uk-UA')}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center gap-1 rounded-lg bg-muted p-4">
                <span className="text-2xl font-bold">{digest.data.newVacancies}</span>
                <span className="text-sm text-muted-foreground">Нових вакансій</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg bg-muted p-4">
                <span className="text-2xl font-bold">{digest.data.newResumes}</span>
                <span className="text-sm text-muted-foreground">Нових резюме</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg bg-muted p-4">
                <span className="text-2xl font-bold">{digest.data.newMatches}</span>
                <span className="text-sm text-muted-foreground">Нових матчів</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Найближчі завдання</CardTitle>
              <CardDescription>На найближчі 24 години</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link to="/app/tasks">Усі завдання</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.data && tasks.data.length > 0 ? (
            <div className="space-y-3">
              {tasks.data.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Typography variant="bodySm" className="font-medium">{task.title}</Typography>
                    <Typography variant="bodySm" tone="muted">
                      {new Date(task.scheduledAt).toLocaleString('uk-UA')}
                    </Typography>
                  </div>
                  <Badge variant={task.eventType === 'interview' ? 'default' : 'secondary'}>
                    {task.eventType === 'interview' ? 'Співбесіда' : task.eventType === 'call' ? 'Дзвінок' : 'Зустріч'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <Typography tone="muted" className="text-center py-4">Немає найближчих завдань</Typography>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
