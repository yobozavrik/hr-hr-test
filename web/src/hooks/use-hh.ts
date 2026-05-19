import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/use-auth'
import { HHApiClient } from '@/lib/hh-api'
import { HrApiClient } from '@/lib/hr-api'

function useHHClient() {
  const auth = useAuth()
  return new HHApiClient(() => auth.accessToken)
}

function useHrClient() {
  const auth = useAuth()
  return new HrApiClient(() => auth.accessToken)
}

// HH Vacancies search
export function useHHVacanciesSearch(params: {
  text: string
  area?: string
  salary?: number
  experience?: string
  employment?: string
  page?: number
}) {
  const client = useHHClient()
  return useQuery({
    queryKey: ['hh', 'vacancies', params],
    queryFn: () => client.searchVacancies(params),
    enabled: !!params.text && !!useAuth().accessToken,
  })
}

export function useHHVacancy(id: string) {
  const client = useHHClient()
  return useQuery({
    queryKey: ['hh', 'vacancy', id],
    queryFn: () => client.getVacancy(id),
    enabled: !!id && !!useAuth().accessToken,
  })
}

export function useHHAreas() {
  const client = useHHClient()
  return useQuery({
    queryKey: ['hh', 'areas'],
    queryFn: () => client.getAreas(),
    enabled: !!useAuth().accessToken,
  })
}

export function useHHDictionaries() {
  const client = useHHClient()
  return useQuery({
    queryKey: ['hh', 'dictionaries'],
    queryFn: () => client.getDictionaries(),
    enabled: !!useAuth().accessToken,
  })
}

// Save vacancy to our database
export function useSaveVacancy() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title: string
      company: string
      location?: string
      salaryFrom?: number
      salaryTo?: number
      currency?: string
      description: string
      source: string
      sourceUrl: string
    }) => client.createVacancy({
      ...data,
      currency: data.currency || 'RUB',
      source: data.source || 'hh.ru',
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vacancies'] }),
  })
}
