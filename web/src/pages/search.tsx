import { useState } from 'react'
import { useHHVacanciesSearch, useHHAreas, useHHDictionaries, useSaveVacancy } from '@/hooks/use-hh'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'

export function SearchPage() {
  const [searchText, setSearchText] = useState('')
  const [area, setArea] = useState('')
  const [salary, setSalary] = useState('')
  const [experience, setExperience] = useState('')
  const [employment, setEmployment] = useState('')
  const [page, setPage] = useState(0)
  
  const { data, isLoading, error } = useHHVacanciesSearch({
    text: searchText || ' ',
    area: area || undefined,
    salary: salary ? Number(salary) : undefined,
    experience: experience || undefined,
    employment: employment || undefined,
    page,
  })

  const { data: areas } = useHHAreas()
  const { data: dicts } = useHHDictionaries()
  const saveMutation = useSaveVacancy()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
  }

  const handleSaveVacancy = (item: any) => {
    saveMutation.mutate({
      title: item.name,
      company: item.employer?.name || 'Unknown',
      location: item.area?.name,
      salaryFrom: item.salary?.from || undefined,
      salaryTo: item.salary?.to || undefined,
      currency: item.salary?.currency || 'RUB',
      description: item.description || item.snippet?.responsibility || item.snippet?.requirement || '',
      source: 'hh.ru',
      sourceUrl: item.alternate_url,
    })
  }

  // Flatten areas for select
  const flattenAreas = (areas: any[] = []): Array<{ id: string; name: string }> => {
    const result: Array<{ id: string; name: string }> = []
    for (const area of areas) {
      result.push({ id: area.id, name: area.name })
      if (area.areas?.length) {
        result.push(...flattenAreas(area.areas))
      }
    }
    return result
  }

  const flatAreas = areas ? flattenAreas(areas) : []

  return (
    <div className="grid gap-6">
      <div>
        <Typography variant="h2">Поиск вакансий</Typography>
        <Typography tone="muted">Поиск вакансий на hh.ru</Typography>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="grid gap-4">
            <div className="grid gap-2">
              <Label>Ключевое слово / Должность</Label>
              <div className="flex gap-2">
                <Input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Например: React разработчик"
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner className="size-4" /> : 'Найти'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="grid gap-2">
                <Label>Город</Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все города" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="">Все города</SelectItem>
                    {flatAreas.slice(0, 100).map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Зарплата от</Label>
                <Input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="100000"
                />
              </div>

              <div className="grid gap-2">
                <Label>Опыт</Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Любой" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Любой</SelectItem>
                    {dicts?.experience?.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Тип занятости</Label>
                <Select value={employment} onValueChange={setEmployment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Любой" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Любой</SelectItem>
                    {dicts?.employment?.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {error && (
        <Card className="p-4 border-destructive">
          <Typography tone="muted" className="text-destructive">Ошибка: {error.message}</Typography>
        </Card>
      )}

      {data && (
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <Typography tone="muted">Найдено: {data.found} вакансий</Typography>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Назад
              </Button>
              <Typography variant="bodySm" className="flex items-center px-2">
                Стр. {page + 1} / {data.pages}
              </Typography>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.pages - 1, p + 1))}
                disabled={page >= data.pages - 1}
              >
                Вперед
              </Button>
            </div>
          </div>

          {data.items?.map((item: any) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Typography tone="muted" className="mt-1">
                      {item.employer?.name} · {item.area?.name}
                    </Typography>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {item.salary ? (
                      <Badge variant="default">
                        {item.salary.from?.toLocaleString()} - {item.salary.to?.toLocaleString()} {item.salary.currency}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">ЗП не указана</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {item.experience && (
                    <Typography variant="bodySm">Опыт: {item.experience.name}</Typography>
                  )}
                  {item.employment && (
                    <Typography variant="bodySm">Тип: {item.employment.name}</Typography>
                  )}
                  {item.snippet?.requirement && (
                    <Typography variant="bodySm" tone="muted">{item.snippet.requirement}</Typography>
                  )}
                  {item.snippet?.responsibility && (
                    <Typography variant="bodySm" tone="muted">{item.snippet.responsibility}</Typography>
                  )}
                  {item.key_skills && item.key_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.key_skills.map((skill: any) => (
                        <Badge key={skill.name} variant="outline">{skill.name}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => handleSaveVacancy(item)}
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? <Spinner className="size-4" /> : 'Сохранить'}
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={item.alternate_url} target="_blank" rel="noopener noreferrer">
                      Открыть на hh.ru
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {data.items?.length === 0 && (
            <Card className="p-8 text-center">
              <Typography tone="muted">Ничего не найдено</Typography>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
