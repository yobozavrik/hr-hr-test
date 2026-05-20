import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  label: string
  shortcut?: string
  icon: React.ReactNode
  category: 'navigation' | 'action' | 'agent'
  action: () => void
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands: CommandItem[] = [
    { id: 'dashboard', label: 'Дашборд', shortcut: 'G D', icon: '📊', category: 'navigation', action: () => navigate({ to: '/app' }) },
    { id: 'vacancies', label: 'Вакансії', shortcut: 'G V', icon: '💼', category: 'navigation', action: () => navigate({ to: '/app/vacancies' }) },
    { id: 'resumes', label: 'Резюме', shortcut: 'G C', icon: '👤', category: 'navigation', action: () => navigate({ to: '/app/resumes' }) },
    { id: 'matches', label: 'Матчі', shortcut: 'G M', icon: '🔗', category: 'navigation', action: () => navigate({ to: '/app/matches' }) },
    { id: 'tasks', label: 'Завдання', shortcut: 'G T', icon: '✅', category: 'navigation', action: () => navigate({ to: '/app/tasks' }) },
    { id: 'analytics', label: 'Аналітика', shortcut: 'G A', icon: '📈', category: 'navigation', action: () => navigate({ to: '/app/analytics' }) },
    { id: 'email', label: 'Email', shortcut: 'G E', icon: '📧', category: 'navigation', action: () => navigate({ to: '/app/email' }) },
    { id: 'agents', label: 'Агенти', icon: '🤖', category: 'navigation', action: () => navigate({ to: '/app/agents' }) },
    { id: 'search', label: 'Пошук', icon: '🔍', category: 'navigation', action: () => navigate({ to: '/app/search' }) },
    { id: 'settings', label: 'Налаштування', icon: '⚙️', category: 'navigation', action: () => navigate({ to: '/app/settings' }) },
    { id: 'new-vacancy', label: 'Нова вакансія', shortcut: '⌘ N', icon: '➕', category: 'action', action: () => { navigate({ to: '/app/vacancies' }); onOpenChange(false) } },
    { id: 'new-task', label: 'Нове завдання', shortcut: '⌘⇧ N', icon: '📝', category: 'action', action: () => { navigate({ to: '/app/tasks' }); onOpenChange(false) } },
    { id: 'marta', label: 'Марта — Сорсер', icon: '🔍', category: 'agent', action: () => { navigate({ to: '/app/agents' }); onOpenChange(false) } },
    { id: 'artur', label: 'Артур — Аналітик', icon: '📊', category: 'agent', action: () => { navigate({ to: '/app/agents' }); onOpenChange(false) } },
    { id: 'sofia', label: 'Софія — Скринінг', icon: '✅', category: 'agent', action: () => { navigate({ to: '/app/agents' }); onOpenChange(false) } },
    { id: 'danilo', label: 'Данило — Інтерв\'ю', icon: '📅', category: 'agent', action: () => { navigate({ to: '/app/agents' }); onOpenChange(false) } },
    { id: 'maksym', label: 'Максим — Офери', icon: '💰', category: 'agent', action: () => { navigate({ to: '/app/agents' }); onOpenChange(false) } },
    { id: 'olena', label: 'Олена — Звіти', icon: '👁️', category: 'agent', action: () => { navigate({ to: '/app/agents' }); onOpenChange(false) } },
  ]

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(search.toLowerCase())
  )

  const categories = ['navigation', 'action', 'agent'] as const
  const categoryLabels: Record<string, string> = { navigation: 'Навігація', action: 'Дії', agent: 'AI Агенти' }

  const grouped = categories
    .map(cat => ({ category: cat, items: filtered.filter(c => c.category === cat) }))
    .filter(g => g.items.length > 0)

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      filtered[selectedIndex].action()
      onOpenChange(false)
      setSearch('')
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onOpenChange(false)
      setSearch('')
    }
  }, [open, filtered, selectedIndex, onOpenChange])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!open) return null

  let globalIndex = 0

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-start justify-center pt-[20vh]" onClick={() => { onOpenChange(false); setSearch('') }}>
      <div className="w-full max-w-xl bg-background rounded-xl shadow-2xl border overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 border-b">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            type="text"
            placeholder="Введіть команду або пошукайте..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {grouped.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Нічого не знайдено
            </div>
          ) : (
            grouped.map(({ category, items }) => (
              <div key={category} className="mb-2">
                <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {categoryLabels[category]}
                </p>
                {items.map(item => {
                  const currentIndex = globalIndex++
                  return (
                    <button
                      key={item.id}
                      onClick={() => { item.action(); onOpenChange(false); setSearch('') }}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors',
                        currentIndex === selectedIndex ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.shortcut && (
                        <div className="flex gap-1">
                          {item.shortcut.split(' ').map((key, i) => (
                            <kbd key={i} className="h-5 min-w-[20px] inline-flex items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t bg-muted/30 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span><kbd className="inline-flex h-4 items-center rounded border bg-background px-1 font-mono">↑↓</kbd> Навігація</span>
          <span><kbd className="inline-flex h-4 items-center rounded border bg-background px-1 font-mono">↵</kbd> Вибрати</span>
          <span><kbd className="inline-flex h-4 items-center rounded border bg-background px-1 font-mono">esc</kbd> Закрити</span>
        </div>
      </div>
    </div>
  )
}
