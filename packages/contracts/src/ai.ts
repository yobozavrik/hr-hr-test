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
