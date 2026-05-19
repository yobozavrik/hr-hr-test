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

export interface HHResume {
  id: string
  title: string
  url?: string
  first_name?: string
  last_name?: string
  middle_name?: string
  age?: number
  gender?: { id: string; name: string }
  area?: { name: string }
  salary?: { amount?: number; currency?: string }
  experience?: Array<{
    position?: string
    company?: string
    start?: string
    end?: string
    description?: string
  }>
  skills?: string
  alternate_url?: string
  updated_at?: string
}

export interface HHResumeSearchResponse {
  items: Array<{ id: string; url: string }>
  found: number
  pages: number
  page: number
}

export class HHService {
  private baseUrl = 'https://api.hh.ru'

  async searchVacancies(params: {
    text: string
    area?: string
    salary?: number
    experience?: string
    employment?: string
    page?: number
    per_page?: number
  }): Promise<HHVacancySearchResponse> {
    const searchParams = new URLSearchParams()
    searchParams.set('text', params.text)
    if (params.area) searchParams.set('area', params.area)
    if (params.salary) searchParams.set('salary', String(params.salary))
    if (params.experience) searchParams.set('experience', params.experience)
    if (params.employment) searchParams.set('employment', params.employment)
    searchParams.set('page', String(params.page ?? 0))
    searchParams.set('per_page', String(params.per_page ?? 20))

    const response = await fetch(`${this.baseUrl}/vacancies?${searchParams.toString()}`, {
      headers: {
        'User-Agent': 'HR-Recruiter/1.0 (your-email@example.com)',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`hh.ru API error: ${response.status}`)
    }

    return response.json()
  }

  async getVacancy(id: string): Promise<HHVacancy> {
    const response = await fetch(`${this.baseUrl}/vacancies/${id}`, {
      headers: {
        'User-Agent': 'HR-Recruiter/1.0 (your-email@example.com)',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`hh.ru API error: ${response.status}`)
    }

    return response.json()
  }

  async searchResumes(params: {
    text: string
    area?: string
    gender?: string
    age_from?: number
    age_to?: number
    salary_from?: number
    salary_to?: number
    education_level?: string
    experience?: string
    page?: number
    per_page?: number
  }): Promise<HHResumeSearchResponse> {
    const searchParams = new URLSearchParams()
    searchParams.set('text', params.text)
    if (params.area) searchParams.set('area', params.area)
    if (params.gender) searchParams.set('gender', params.gender)
    if (params.age_from) searchParams.set('age_from', String(params.age_from))
    if (params.age_to) searchParams.set('age_to', String(params.age_to))
    if (params.salary_from) searchParams.set('salary_from', String(params.salary_from))
    if (params.salary_to) searchParams.set('salary_to', String(params.salary_to))
    if (params.education_level) searchParams.set('education_level', params.education_level)
    if (params.experience) searchParams.set('experience', params.experience)
    searchParams.set('page', String(params.page ?? 0))
    searchParams.set('per_page', String(params.per_page ?? 20))

    const response = await fetch(`${this.baseUrl}/resumes?${searchParams.toString()}`, {
      headers: {
        'User-Agent': 'HR-Recruiter/1.0 (your-email@example.com)',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`hh.ru API error: ${response.status} (возможно, нужна авторизация работодателя)`)
    }

    return response.json()
  }

  async getAreas(): Promise<Array<{ id: string; name: string; parent_id?: string }>> {
    const response = await fetch(`${this.baseUrl}/areas`, {
      headers: {
        'User-Agent': 'HR-Recruiter/1.0 (your-email@example.com)',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`hh.ru API error: ${response.status}`)
    }

    return response.json()
  }

  async getDictionaries(): Promise<{
    experience: Array<{ id: string; name: string }>
    employment: Array<{ id: string; name: string }>
  }> {
    const response = await fetch(`${this.baseUrl}/dictionaries`, {
      headers: {
        'User-Agent': 'HR-Recruiter/1.0 (your-email@example.com)',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`hh.ru API error: ${response.status}`)
    }

    return response.json()
  }
}
