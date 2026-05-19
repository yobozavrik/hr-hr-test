import type {
  CreateVacancyRequest,
  UpdateVacancyRequest,
  CreateResumeRequest,
  UpdateResumeRequest,
  CreateMatchRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  SendEmailRequest,
  CreateSalaryReportRequest,
} from '@hr-recruiter/contracts'

const apiBaseUrl = (import.meta.env?.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export class HrApiClient {
  private getAccessToken: () => string | null

  constructor(getAccessToken: () => string | null) {
    this.getAccessToken = getAccessToken
  }

  private async request(path: string, options: { method?: string; body?: unknown } = {}) {
    const token = this.getAccessToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-Platform': 'web',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method ?? 'GET',
      credentials: 'include',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Vacancies
  getVacancies() {
    return this.request('/api/hr/vacancies')
  }

  getVacancy(id: string) {
    return this.request(`/api/hr/vacancies/${id}`)
  }

  createVacancy(data: CreateVacancyRequest) {
    return this.request('/api/hr/vacancies', { method: 'POST', body: data })
  }

  updateVacancy(id: string, data: UpdateVacancyRequest) {
    return this.request(`/api/hr/vacancies/${id}`, { method: 'PATCH', body: data })
  }

  deleteVacancy(id: string) {
    return this.request(`/api/hr/vacancies/${id}`, { method: 'DELETE' })
  }

  // Resumes
  getResumes() {
    return this.request('/api/hr/resumes')
  }

  getResume(id: string) {
    return this.request(`/api/hr/resumes/${id}`)
  }

  createResume(data: CreateResumeRequest) {
    return this.request('/api/hr/resumes', { method: 'POST', body: data })
  }

  updateResume(id: string, data: UpdateResumeRequest) {
    return this.request(`/api/hr/resumes/${id}`, { method: 'PATCH', body: data })
  }

  deleteResume(id: string) {
    return this.request(`/api/hr/resumes/${id}`, { method: 'DELETE' })
  }

  // Matches
  getMatches() {
    return this.request('/api/hr/matches')
  }

  createMatch(data: CreateMatchRequest) {
    return this.request('/api/hr/matches', { method: 'POST', body: data })
  }

  updateMatch(id: string, status: string) {
    return this.request(`/api/hr/matches/${id}`, { method: 'PATCH', body: { status } })
  }

  // Tasks
  getTasks() {
    return this.request('/api/hr/tasks')
  }

  getUpcomingTasks() {
    return this.request('/api/hr/tasks/upcoming')
  }

  createTask(data: CreateTaskRequest) {
    return this.request('/api/hr/tasks', { method: 'POST', body: data })
  }

  updateTask(id: string, data: UpdateTaskRequest) {
    return this.request(`/api/hr/tasks/${id}`, { method: 'PATCH', body: data })
  }

  deleteTask(id: string) {
    return this.request(`/api/hr/tasks/${id}`, { method: 'DELETE' })
  }

  // Email
  getEmailLogs() {
    return this.request('/api/hr/emails/logs')
  }

  sendEmail(data: SendEmailRequest) {
    return this.request('/api/hr/emails/send', { method: 'POST', body: data })
  }

  // Salary reports
  getSalaryReports() {
    return this.request('/api/hr/salary/reports')
  }

  createSalaryReport(data: CreateSalaryReportRequest) {
    return this.request('/api/hr/salary/reports', { method: 'POST', body: data })
  }

  // Daily digest
  getDailyDigest() {
    return this.request('/api/hr/digest/daily')
  }

  // Unified Job Boards Search
  search(params: {
    text: string
    type: 'vacancy' | 'resume'
    source: 'all' | 'work.ua' | 'robota.ua' | 'linkedin'
    page?: number
    location?: string
  }) {
    const searchParams = new URLSearchParams()
    searchParams.set('text', params.text)
    searchParams.set('type', params.type)
    searchParams.set('source', params.source)
    if (params.page !== undefined) searchParams.set('page', String(params.page))
    if (params.location) searchParams.set('location', params.location)

    return this.request(`/api/hr/search?${searchParams.toString()}`)
  }

  // Real-Time Match AI Analysis
  analyzeMatch(data: {
    vacancy: { title: string; description: string }
    resume: { name: string; position: string; skills: string[]; experience?: string; education?: string }
  }) {
    return this.request('/api/hr/search/match-analyze', { method: 'POST', body: data })
  }

  // AI Employees endpoints
  aiGenerateOutreach(data: { candidateName: string; candidatePosition: string; vacancyTitle: string }) {
    return this.request('/api/hr/ai/outreach', { method: 'POST', body: data })
  }

  aiAnalyzeSalary(data: { position: string }) {
    return this.request('/api/hr/ai/salary', { method: 'POST', body: data })
  }

  aiExpandSearch(data: { text: string }) {
    return this.request('/api/hr/ai/expand', { method: 'POST', body: data })
  }
}

