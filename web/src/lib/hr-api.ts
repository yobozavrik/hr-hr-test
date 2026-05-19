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

  // Google
  getGoogleAuthUrl(scope: string) {
    return this.request(`/api/google/auth-url/${scope}`)
  }

  getGoogleStatus() {
    return this.request('/api/google/status')
  }

  createCalendarEvent(data: { summary: string; description?: string; start: string; end: string }) {
    return this.request('/api/google/calendar/events', { method: 'POST', body: data })
  }

  createSpreadsheet(title: string) {
    return this.request('/api/google/sheets', { method: 'POST', body: { title } })
  }

  sendGmail(data: { to: string; subject: string; body: string }) {
    return this.request('/api/google/gmail/send', { method: 'POST', body: data })
  }
}
