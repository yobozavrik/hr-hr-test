import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/use-auth'
import { HrApiClient } from '@/lib/hr-api'

function useHrClient() {
  const auth = useAuth()
  return new HrApiClient(() => auth.accessToken)
}

// Save vacancy to our database
export function useSaveVacancy() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title: string
      company: string
      location?: string | null
      salaryFrom?: number | null
      salaryTo?: number | null
      currency?: string | null
      description: string
      source: string
      sourceUrl?: string | null
    }) => client.createVacancy({
      title: data.title,
      company: data.company,
      location: data.location || undefined,
      salaryFrom: data.salaryFrom || undefined,
      salaryTo: data.salaryTo || undefined,
      currency: data.currency || 'UAH',
      description: data.description,
      source: data.source,
      sourceUrl: data.sourceUrl || undefined,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vacancies'] }),
  })
}

// Save resume to our database
export function useSaveResume() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      fullName: string
      position: string
      location?: string | null
      salary?: number | null
      currency?: string | null
      skills?: string[]
      experience?: string | null
      education?: string | null
      source: string
      sourceUrl?: string | null
    }) => client.createResume({
      fullName: data.fullName,
      position: data.position,
      salary: data.salary || undefined,
      currency: data.currency || 'UAH',
      skills: data.skills || [],
      experience: data.experience || undefined,
      education: data.education || undefined,
      source: data.source,
      sourceUrl: data.sourceUrl || undefined,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resumes'] }),
  })
}

// Unified multi-board search hook
export function useJobBoardSearch(params: {
  text: string
  type: 'vacancy' | 'resume'
  source: 'all' | 'work.ua' | 'robota.ua' | 'linkedin'
  page?: number
  location?: string
}) {
  const client = useHrClient()
  return useQuery({
    queryKey: ['search', 'multi', params],
    queryFn: () => client.search(params),
    enabled: !!params.text && !!useAuth().accessToken,
  })
}

// Real-time AI match analysis hook
export function useAnalyzeMatch() {
  const client = useHrClient()
  return useMutation({
    mutationFn: (data: {
      vacancy: { title: string; description: string }
      resume: { name: string; position: string; skills: string[]; experience?: string; education?: string }
    }) => client.analyzeMatch(data),
  })
}

