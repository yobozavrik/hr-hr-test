import { useState } from 'react'
import { useGoogleStatus } from '@/hooks/use-hr'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'

const integrations = [
  {
    id: 'calendar',
    name: 'Google Calendar',
    description: 'Создание задач и встреч в календаре',
    scopes: ['calendar'],
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    description: 'Экспорт данных в таблицы',
    scopes: ['sheets'],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Отправка и чтение писем',
    scopes: ['gmail'],
  },
]

export function IntegrationsPage() {
  const { data: status, isLoading } = useGoogleStatus()
  const [connecting, setConnecting] = useState<string | null>(null)

  const handleConnect = async (scope: string) => {
    setConnecting(scope)
    try {
      const apiUrl = (import.meta.env?.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${apiUrl}/api/google/auth-url/${scope}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Failed to get auth URL:', error)
    } finally {
      setConnecting(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div>
        <Typography variant="h2">Интеграции</Typography>
        <Typography tone="muted">Подключение внешних сервисов</Typography>
      </div>

      <div className="grid gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{integration.name}</CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </div>
                <Badge variant={status?.connected ? 'default' : 'secondary'}>
                  {status?.connected ? 'Подключено' : 'Не подключено'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleConnect(integration.scopes[0])}
                disabled={connecting === integration.scopes[0] || status?.connected}
              >
                {connecting === integration.scopes[0] ? (
                  <Spinner className="size-4" />
                ) : status?.connected ? (
                  'Подключено'
                ) : (
                  'Подключить'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
