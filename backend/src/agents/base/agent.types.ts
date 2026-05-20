import type { AgentStatus } from './agent.interface'

export interface AgentStatusReport {
  id: string
  name: string
  status: AgentStatus
  capabilities: string[]
}

export interface SourcingResult {
  candidates: any[]
  totalFound: number
  sources: string[]
  searchQuery: string
}

export interface AnalyticsResult {
  salaryMin: number
  salaryMax: number
  salaryMedian: number
  demandIndex: 'low' | 'medium' | 'high'
  competitorActiveCount: number
}

export interface MatchingResult {
  matchScore: number
  strengths: string[]
  gaps: string[]
}

export interface ScreeningResult {
  passed: boolean
  overallScore: number
  technicalRating: number
  culturalRating: number
  generatedQuestions: string[]
}

export interface OutreachResult {
  emailSubject: string
  emailBody: string
  sent: boolean
}

export interface ReportingResult {
  exportedPath?: string
  summary: string
  details: Record<string, any>
}
