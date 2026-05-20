import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

export function SettingsPage() {
  const [name, setName] = useState('Олександр Мельник')
  const [email, setEmail] = useState('oleksandr@techcorp.com')
  const [role, setRole] = useState('Senior HR Manager')
  const [company, setCompany] = useState('TechCorp')
  const [language, setLanguage] = useState('uk')
  const [notifications, setNotifications] = useState({
    newMatches: true,
    taskReminders: true,
    emailUpdates: false,
    weeklyReport: true,
    agentAlerts: true,
    marketingEmails: false,
  })
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('30')

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Typography variant="h2">Налаштування</Typography>
        <Typography tone="muted" className="mt-1">Керування профілем, сповіщеннями та безпекою</Typography>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Профіль</TabsTrigger>
          <TabsTrigger value="notifications">Сповіщення</TabsTrigger>
          <TabsTrigger value="integrations">Інтеграції</TabsTrigger>
          <TabsTrigger value="security">Безпека</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-6">
          <div className="rounded-lg border p-6 space-y-4">
            <Typography variant="h3" className="text-base">Особиста інформація</Typography>
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">ОМ</div>
              <div>
                <Button variant="outline" size="sm">Змінити фото</Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG до 2MB</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Ім'я</Label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" />
              </div>
              <div className="space-y-1.5">
                <Label>Посада</Label>
                <Input value={role} onChange={e => setRole(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Компанія</Label>
                <Input value={company} onChange={e => setCompany(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Мова інтерфейсу</Label>
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="uk">Українська</option>
                  <option value="en">English</option>
                  <option value="pl">Polski</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline">Скасувати</Button>
              <Button>Зберегти зміни</Button>
            </div>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="rounded-lg border p-6 space-y-4">
            <Typography variant="h3" className="text-base">Сповіщення</Typography>
            <Typography tone="muted" className="text-sm">Оберіть, які сповіщення ви хочете отримувати</Typography>
            <Separator />
            <div className="space-y-4">
              {Object.entries({
                newMatches: { label: 'Нові матчі', desc: 'Сповіщення коли з\'являється новий матч кандидата з вакансією' },
                taskReminders: { label: 'Нагадування про завдання', desc: 'Нагадування про дедлайни та заплановані завдання' },
                emailUpdates: { label: 'Оновлення email', desc: 'Сповіщення про нові відповіді на email' },
                weeklyReport: { label: 'Щотижневий звіт', desc: 'Автоматичний звіт по понеділках' },
                agentAlerts: { label: 'Сповіщення агентів', desc: 'Коли AI-агент завершує завдання або потребує затвердження' },
                marketingEmails: { label: 'Маркетингові email', desc: 'Новини продукту, оновлення функцій' },
              }).map(([key, { label, desc }]) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch checked={notifications[key as keyof typeof notifications]}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [key]: checked }))} />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button>Зберегти</Button>
            </div>
          </div>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="rounded-lg border p-6 space-y-4">
            <Typography variant="h3" className="text-base">Інтеграції</Typography>
            <Typography tone="muted" className="text-sm">Підключення до зовнішніх сервісів та job boards</Typography>
            <Separator />
            <div className="space-y-3">
              {[
                { name: 'Work.ua', desc: 'Пошук кандидатів на Work.ua', status: 'connected', icon: '💼' },
                { name: 'Robota.ua', desc: 'Пошук кандидатів на Robota.ua', status: 'connected', icon: '💼' },
                { name: 'LinkedIn', desc: 'Імпорт профілів та вакансій', status: 'disconnected', icon: '🔗' },
                { name: 'Google Calendar', desc: 'Синхронізація інтерв\'ю', status: 'connected', icon: '📅' },
                { name: 'Gmail', desc: 'Надсилання email через Gmail', status: 'disconnected', icon: '📧' },
                { name: 'Slack', desc: 'Сповіщення в Slack канал', status: 'disconnected', icon: '💬' },
              ].map(integration => (
                <div key={integration.name} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">{integration.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={integration.status === 'connected' ? 'default' : 'outline'} className="text-xs">
                      {integration.status === 'connected' ? 'Підключено' : 'Не підключено'}
                    </Badge>
                    <Button size="sm" variant={integration.status === 'connected' ? 'outline' : 'default'}>
                      {integration.status === 'connected' ? 'Налаштувати' : 'Підключити'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <div className="rounded-lg border p-6 space-y-4">
            <Typography variant="h3" className="text-base">Безпека</Typography>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Змінити пароль</p>
                  <p className="text-xs text-muted-foreground">Остання зміна: 30 днів тому</p>
                </div>
                <Button variant="outline" size="sm">Змінити</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Двофакторна автентифікація</p>
                  <p className="text-xs text-muted-foreground">Додатковий рівень захисту через SMS або TOTP</p>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label>Таймаут сесії (хвилин)</Label>
                <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="15">15 хвилин</option>
                  <option value="30">30 хвилин</option>
                  <option value="60">1 година</option>
                  <option value="120">2 години</option>
                </select>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Активні сесії</p>
                  <p className="text-xs text-muted-foreground">Chrome on Windows • Київ, Україна • Зараз</p>
                </div>
                <Button variant="outline" size="sm">Завершити всі</Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-red-200 dark:border-red-900 p-6 space-y-4">
            <Typography variant="h3" className="text-base text-red-600 dark:text-red-400">Небезпечна зона</Typography>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Видалити акаунт</p>
                <p className="text-xs text-muted-foreground">Ця дія є незворотною. Всі дані будуть видалені.</p>
              </div>
              <Button variant="destructive" size="sm">Видалити</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
