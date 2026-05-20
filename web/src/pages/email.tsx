import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Email {
  id: string
  from: string
  subject: string
  preview: string
  date: string
  time: string
  read: boolean
  hasAttachment: boolean
  starred: boolean
  folder: 'inbox' | 'sent' | 'templates' | 'important' | 'trash'
}

const mockEmails: Email[] = [
  { id: '1', from: 'Іван Петренко', subject: 'Re: Інтерв\'ю — 18.05 о 10:00', preview: 'Дякую за запрошення, підтверджую свою участь...', date: 'Сьогодні', time: '09:15', read: false, hasAttachment: true, starred: false, folder: 'inbox' },
  { id: '2', from: 'HR Team', subject: 'Re: Recruitment metrics', preview: 'Weekly report attached. Please review the conversion rates...', date: 'Вчора', time: '17:30', read: true, hasAttachment: true, starred: true, folder: 'inbox' },
  { id: '3', from: 'Олена Коваль', subject: 'Re: Job Offer — TechCorp', preview: 'Дякую за оффер! Хочу уточнити деталі щодо компенсації...', date: '15.05', time: '14:22', read: true, hasAttachment: false, starred: false, folder: 'inbox' },
  { id: '4', from: 'Дмитро Козлов', subject: 'Re: Screening results', preview: 'Thanks for the detailed feedback. I\'ve attached my updated CV...', date: '14.05', time: '11:00', read: true, hasAttachment: true, starred: false, folder: 'inbox' },
  { id: '5', from: 'Марія Бондар', subject: 'Re: Follow-up on application', preview: 'I\'m still very interested in the position. Looking forward to hearing from you...', date: '13.05', time: '16:45', read: true, hasAttachment: false, starred: true, folder: 'inbox' },
  { id: '6', from: 'TechCorp HR', subject: 'Interview invitation — Senior React Dev', preview: 'You have been selected for the technical interview stage...', date: '12.05', time: '10:30', read: true, hasAttachment: false, starred: false, folder: 'sent' },
  { id: '7', from: 'TechCorp HR', subject: 'Welcome package — Onboarding docs', preview: 'Please find attached the onboarding documentation...', date: '11.05', time: '09:00', read: true, hasAttachment: true, starred: false, folder: 'sent' },
]

const templates = [
  { id: 't1', name: 'Інтерв\'ю', description: 'Запрошення на технічне інтерв\'ю' },
  { id: 't2', name: 'Офер', description: 'Шаблон job offer листа' },
  { id: 't3', name: 'Відмова', description: 'Ввічлива відмова кандидату' },
  { id: 't4', name: 'Follow-up', description: 'Нагадування після інтерв\'ю' },
]

export function EmailPage() {
  const [folder, setFolder] = useState<Email['folder']>('inbox')
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')

  const filteredEmails = mockEmails.filter(e => {
    if (folder === 'important') return e.starred
    if (folder === 'templates') return false
    return e.folder === folder
  }).filter(e => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return e.from.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q) || e.preview.toLowerCase().includes(q)
  })

  const folderCounts = {
    inbox: mockEmails.filter(e => e.folder === 'inbox').length,
    sent: mockEmails.filter(e => e.folder === 'sent').length,
    templates: templates.length,
    important: mockEmails.filter(e => e.starred).length,
    trash: 0,
  }

  const folderIcons: Record<string, React.ReactNode> = {
    inbox: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>,
    sent: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>,
    templates: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
    important: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    trash: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>,
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Sidebar */}
      <div className="w-56 shrink-0 space-y-4">
        <Button className="w-full" onClick={() => setShowCompose(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
          Написати
        </Button>

        <nav className="space-y-1">
          {(Object.keys(folderCounts) as Email['folder'][]).map(f => (
            <button key={f} onClick={() => { setFolder(f); setSelectedEmail(null) }}
              className={cn('w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                folder === f ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted')}>
              <div className="flex items-center gap-2">
                {folderIcons[f]}
                <span className="capitalize">{f === 'inbox' ? 'Вхідні' : f === 'sent' ? 'Надіслані' : f === 'templates' ? 'Шаблони' : f === 'important' ? 'Важливі' : 'Кошик'}</span>
              </div>
              {folderCounts[f] > 0 && <Badge variant="outline" className="text-xs">{folderCounts[f]}</Badge>}
            </button>
          ))}
        </nav>

        {folder === 'templates' && (
          <div className="pt-4 border-t space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase px-3">Шаблони</p>
            {templates.map(t => (
              <button key={t.id} className="w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-muted transition-colors">
                <span className="block font-medium">{t.name}</span>
                <span className="block text-xs text-muted-foreground">{t.description}</span>
              </button>
            ))}
          </div>
        )}

        <div className="pt-4 border-t space-y-2 px-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Статистика</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Надіслано:</span><span className="font-medium text-foreground">45</span></div>
            <div className="flex justify-between"><span>Відкрито:</span><span className="font-medium text-emerald-600">38</span></div>
            <div className="flex justify-between"><span>Відповіли:</span><span className="font-medium text-primary">22</span></div>
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="w-80 shrink-0 border rounded-lg flex flex-col">
        <div className="p-3 border-b">
          <Input placeholder="Пошук в листах..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="h-8" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-50"><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
              <p className="text-sm">Немає листів</p>
            </div>
          ) : (
            filteredEmails.map(email => (
              <button key={email.id} onClick={() => setSelectedEmail(email)}
                className={cn('w-full text-left p-4 border-b transition-colors hover:bg-muted/50',
                  selectedEmail?.id === email.id ? 'bg-muted' : '',
                  !email.read ? 'bg-primary/5' : '')}>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-sm truncate', !email.read && 'font-semibold')}>{email.from}</span>
                  {email.starred && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-amber-400 shrink-0 ml-2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
                </div>
                <p className={cn('text-xs truncate', !email.read && 'font-medium')}>{email.subject}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground truncate">{email.date}, {email.time}</span>
                  <div className="flex items-center gap-1">
                    {email.hasAttachment && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Email Detail */}
      <div className="flex-1 border rounded-lg flex flex-col">
        {selectedEmail ? (
          <>
            <div className="p-4 border-b flex items-start justify-between">
              <div>
                <Typography variant="h3" className="text-lg">{selectedEmail.subject}</Typography>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{selectedEmail.from}</span>
                  <span>{selectedEmail.date}, {selectedEmail.time}</span>
                  {selectedEmail.hasAttachment && <Badge variant="outline" className="text-xs">📎 2</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                </Button>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                </Button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <p className="text-sm leading-relaxed">{selectedEmail.preview}</p>
              <p className="text-sm leading-relaxed mt-4 text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
            <div className="p-4 border-t">
              <Button size="sm">Відповісти</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-30"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
            <p className="text-sm">Оберіть лист для перегляду</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowCompose(false)}>
          <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <Typography variant="h3" className="text-base">Новий лист</Typography>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowCompose(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </Button>
            </div>
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              <Input placeholder="Кому" value={composeTo} onChange={e => setComposeTo(e.target.value)} />
              <Input placeholder="Тема" value={composeSubject} onChange={e => setComposeSubject(e.target.value)} />
              <textarea placeholder="Напишіть повідомлення..." value={composeBody} onChange={e => setComposeBody(e.target.value)}
                className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
            </div>
            <div className="flex items-center justify-between p-4 border-t">
              <Button variant="outline" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                Додати файл
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCompose(false)}>Зберегти чернетку</Button>
                <Button>Надіслати</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
