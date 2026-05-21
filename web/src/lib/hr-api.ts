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

export interface VacancyRecord {
  id: string
  userId: string
  title: string
  company: string
  location: string | null
  salaryFrom: number | null
  salaryTo: number | null
  currency: string
  description: string
  source: string
  sourceUrl: string | null
  status: 'active' | 'closed' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface ResumeRecord {
  id: string
  userId: string
  fullName: string
  email: string | null
  phone: string | null
  position: string
  salary: number | null
  currency: string
  skills: string[]
  experience: string | null
  education: string | null
  source: string | null
  sourceUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface MatchRecord {
  id: string
  vacancyId: string
  resumeId: string
  score: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  vacancy: VacancyRecord | null
  resume: ResumeRecord | null
}

export interface TaskRecord {
  id: string
  userId: string
  title: string
  description: string | null
  eventType: 'interview' | 'call' | 'meeting'
  scheduledAt: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface AgentTaskRecord {
  id: string
  agentId: string
  taskTitle: string
  status: string
  inputParams: string | null
  outputResult: string | null
  durationMs: number | null
  createdAt: string
  updatedAt: string
}

export interface AgentStatRecord {
  agentId: string
  totalTasks: number
  completedTasks: number
  failedTasks: number
  avgDurationMs: number
}

const apiBaseUrl = (import.meta.env?.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export class HrApiClient {
  private getAccessToken: () => string | null
  private platform: 'web' | 'mobile'

  constructor(getAccessToken: () => string | null, platform: 'web' | 'mobile' = 'web') {
    this.getAccessToken = getAccessToken
    this.platform = platform
  }

  private async request(path: string, options: { method?: string; body?: unknown } = {}) {
    const token = this.getAccessToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-Platform': this.platform,
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
  getVacancies(): Promise<VacancyRecord[]> {
    return this.request('/api/hr/vacancies')
  }

  getVacancy(id: string): Promise<VacancyRecord> {
    return this.request(`/api/hr/vacancies/${id}`)
  }

  createVacancy(data: CreateVacancyRequest): Promise<VacancyRecord> {
    return this.request('/api/hr/vacancies', { method: 'POST', body: data })
  }

  updateVacancy(id: string, data: UpdateVacancyRequest): Promise<{ count: number }> {
    return this.request(`/api/hr/vacancies/${id}`, { method: 'PATCH', body: data })
  }

  deleteVacancy(id: string): Promise<{ count: number }> {
    return this.request(`/api/hr/vacancies/${id}`, { method: 'DELETE' })
  }

  // Resumes
  getResumes(): Promise<ResumeRecord[]> {
    return this.request('/api/hr/resumes')
  }

  getResume(id: string): Promise<ResumeRecord> {
    return this.request(`/api/hr/resumes/${id}`)
  }

  createResume(data: CreateResumeRequest): Promise<ResumeRecord> {
    return this.request('/api/hr/resumes', { method: 'POST', body: data })
  }

  updateResume(id: string, data: UpdateResumeRequest): Promise<{ count: number }> {
    return this.request(`/api/hr/resumes/${id}`, { method: 'PATCH', body: data })
  }

  deleteResume(id: string): Promise<{ count: number }> {
    return this.request(`/api/hr/resumes/${id}`, { method: 'DELETE' })
  }

  // Matches
  getMatches(): Promise<MatchRecord[]> {
    return this.request('/api/hr/matches')
  }

  createMatch(data: CreateMatchRequest): Promise<MatchRecord> {
    return this.request('/api/hr/matches', { method: 'POST', body: data })
  }

  updateMatch(id: string, status: string): Promise<MatchRecord> {
    return this.request(`/api/hr/matches/${id}`, { method: 'PATCH', body: { status } })
  }

  // Tasks
  getTasks(): Promise<TaskRecord[]> {
    return this.request('/api/hr/tasks')
  }

  getUpcomingTasks(): Promise<TaskRecord[]> {
    return this.request('/api/hr/tasks/upcoming')
  }

  createTask(data: CreateTaskRequest): Promise<TaskRecord> {
    return this.request('/api/hr/tasks', { method: 'POST', body: data })
  }

  updateTask(id: string, data: UpdateTaskRequest): Promise<{ count: number }> {
    return this.request(`/api/hr/tasks/${id}`, { method: 'PATCH', body: data })
  }

  deleteTask(id: string): Promise<{ count: number }> {
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

  aiTrackSalary(data: { position: string; budget: number }) {
    return this.request('/api/hr/ai/salary-track', { method: 'POST', body: data })
  }

  aiTrackCompetitors(data: { company: string; niche: string }) {
    return this.request('/api/hr/ai/competitors', { method: 'POST', body: data })
  }

  // Agent Dashboard API
  getAgentStats(): Promise<AgentStatRecord[]> {
    return this.request('/api/hr/agents/stats')
  }

  getAgentTasks(agentId?: string): Promise<AgentTaskRecord[]> {
    const url = agentId ? `/api/hr/agents/tasks?agentId=${agentId}` : '/api/hr/agents/tasks'
    return this.request(url)
  }

  createAgentTask(data: { agentId: string; taskTitle: string; inputParams?: string }): Promise<AgentTaskRecord> {
    return this.request('/api/hr/agents/tasks', { method: 'POST', body: data })
  }

  updateAgentTask(agentId: string, taskId: string, data: { status: string; outputResult?: string; durationMs?: number }): Promise<{ success: boolean }> {
    return this.request(`/api/hr/agents/tasks/${agentId}/${taskId}`, { method: 'PATCH', body: data })
  }

  // Agent Chat API
  getAgentConfigs() {
    return this.request('/api/hr/agents-chat/configs')
  }

  chatWithAgent(data: { agentId: string; messages: { role: string; content: string }[]; vacancyId?: string; resumeId?: string }) {
    return this.request('/api/hr/agents-chat/chat', { method: 'POST', body: data })
  }

  analyzeMatchLLM(data: {
    vacancy: { title: string; company?: string; location?: string; salaryFrom?: number; salaryTo?: number; description?: string; requirements?: string[] }
    resume: { fullName: string; position?: string; skills?: string[]; experience?: string; education?: string; salary?: string }
  }) {
    return this.request('/api/hr/agents-chat/analyze-match', { method: 'POST', body: data })
  }
}

