const apiBaseUrl = (import.meta.env?.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export interface HHVacancy {
  id: string
  name: string
  employer: { name: string; alternate_url?: string }
  area: { name: string }
  salary?: { from?: number; to?: number; currency?: string }
  description?: string
  alternate_url: string
  published_at: string
  experience?: { name: string }
  employment?: { name: string }
  snippet?: { requirement?: string; responsibility?: string }
  key_skills?: Array<{ name: string }>
}

export interface HHVacancySearchResponse {
  items: HHVacancy[]
  found: number
  pages: number
  page: number
}

export class HHApiClient {
  private getAccessToken: () => string | null

  constructor(getAccessToken: () => string | null) {
    this.getAccessToken = getAccessToken
  }

  private async request(path: string) {
    const token = this.getAccessToken()
    const headers: Record<string, string> = {
      'X-Client-Platform': 'web',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: 'include',
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  searchVacancies(params: {
    text: string
    area?: string
    salary?: number
    experience?: string
    employment?: string
    page?: number
  }): Promise<HHVacancySearchResponse> {
    const searchParams = new URLSearchParams()
    searchParams.set('text', params.text)
    if (params.area) searchParams.set('area', params.area)
    if (params.salary) searchParams.set('salary', String(params.salary))
    if (params.experience) searchParams.set('experience', params.experience)
    if (params.employment) searchParams.set('employment', params.employment)
    if (params.page !== undefined) searchParams.set('page', String(params.page))

    return this.request(`/api/hh/vacancies?${searchParams.toString()}`)
  }

  getVacancy(id: string): Promise<HHVacancy> {
    return this.request(`/api/hh/vacancies/${id}`)
  }

  getAreas(): Promise<Array<{ id: string; name: string }>> {
    return this.request('/api/hh/areas')
  }

  getDictionaries(): Promise<{
    experience: Array<{ id: string; name: string }>
    employment: Array<{ id: string; name: string }>
  }> {
    return this.request('/api/hh/dictionaries')
  }
}
