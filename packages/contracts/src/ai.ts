import { z } from 'zod'

// Sofia Outreach Email Generator
export const aiGenerateOutreachRequestSchema = z.object({
  candidateName: z.string().min(1),
  candidatePosition: z.string().min(1),
  vacancyTitle: z.string().min(1),
})

export type AiGenerateOutreachRequest = z.infer<typeof aiGenerateOutreachRequestSchema>

// Danilo Salary Analytics
export const aiAnalyzeSalaryRequestSchema = z.object({
  position: z.string().min(1),
})

export type AiAnalyzeSalaryRequest = z.infer<typeof aiAnalyzeSalaryRequestSchema>

// Marta Search Query Expander
export const aiExpandSearchRequestSchema = z.object({
  text: z.string().min(1),
})

export type AiExpandSearchRequest = z.infer<typeof aiExpandSearchRequestSchema>

// Maksym Salary Tracker
export const aiTrackSalaryRequestSchema = z.object({
  position: z.string().min(1),
  budget: z.number().positive(),
})

export type AiTrackSalaryRequest = z.infer<typeof aiTrackSalaryRequestSchema>

// Olena Competitor Tracker
export const aiTrackCompetitorsRequestSchema = z.object({
  company: z.string().min(1),
  niche: z.string().min(1),
})

export type AiTrackCompetitorsRequest = z.infer<typeof aiTrackCompetitorsRequestSchema>

// Agent Chat
export const chatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
})

export const agentChatRequestSchema = z.object({
  agentId: z.string(),
  messages: z.array(chatMessageSchema),
  vacancyId: z.string().optional(),
  resumeId: z.string().optional(),
})

export type AgentChatRequest = z.infer<typeof agentChatRequestSchema>

// Match Analysis
export const matchAnalysisVacancySchema = z.object({
  title: z.string(),
  company: z.string().optional(),
  location: z.string().optional(),
  salaryFrom: z.number().optional(),
  salaryTo: z.number().optional(),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
})

export const matchAnalysisResumeSchema = z.object({
  fullName: z.string(),
  position: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  salary: z.string().optional(),
})

export const matchAnalysisRequestSchema = z.object({
  vacancy: matchAnalysisVacancySchema,
  resume: matchAnalysisResumeSchema,
})

export type MatchAnalysisRequest = z.infer<typeof matchAnalysisRequestSchema>
