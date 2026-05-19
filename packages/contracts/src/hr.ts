import { z } from 'zod'

// Vacancy schemas
export const vacancySchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string().nullable(),
  salaryFrom: z.number().nullable(),
  salaryTo: z.number().nullable(),
  currency: z.string(),
  description: z.string(),
  source: z.string(),
  sourceUrl: z.string().nullable(),
  status: z.enum(['active', 'closed', 'archived']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const createVacancyRequestSchema = z.object({
  title: z.string().min(1).max(255),
  company: z.string().min(1).max(255),
  location: z.string().max(255).optional(),
  salaryFrom: z.number().min(0).optional(),
  salaryTo: z.number().min(0).optional(),
  currency: z.string().default('RUB'),
  description: z.string().min(1),
  source: z.string().default('manual'),
  sourceUrl: z.string().url().optional(),
})

export const updateVacancyRequestSchema = createVacancyRequestSchema.partial().extend({
  status: z.enum(['active', 'closed', 'archived']).optional(),
})

// Resume schemas
export const resumeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fullName: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  position: z.string(),
  salary: z.number().nullable(),
  currency: z.string(),
  skills: z.array(z.string()),
  experience: z.string().nullable(),
  education: z.string().nullable(),
  source: z.string(),
  sourceUrl: z.string().nullable(),
  status: z.enum(['new', 'contact', 'interview', 'offer', 'hired', 'rejected']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const createResumeRequestSchema = z.object({
  fullName: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  position: z.string().min(1).max(255),
  salary: z.number().min(0).optional(),
  currency: z.string().default('RUB'),
  skills: z.array(z.string()).default([]),
  experience: z.string().optional(),
  education: z.string().optional(),
  source: z.string().default('manual'),
  sourceUrl: z.string().url().optional(),
})

export const updateResumeRequestSchema = createResumeRequestSchema.partial().extend({
  status: z.enum(['new', 'contact', 'interview', 'offer', 'hired', 'rejected']).optional(),
})

// Match schemas
export const matchSchema = z.object({
  id: z.string(),
  vacancyId: z.string(),
  resumeId: z.string(),
  score: z.number(),
  status: z.enum(['pending', 'approved', 'rejected']),
  createdAt: z.string().datetime(),
  vacancy: vacancySchema.optional(),
  resume: resumeSchema.optional(),
})

export const createMatchRequestSchema = z.object({
  vacancyId: z.string(),
  resumeId: z.string(),
})

// Task schemas
export const taskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  eventType: z.enum(['interview', 'call', 'meeting']),
  scheduledAt: z.string().datetime(),
  googleEventId: z.string().nullable(),
  status: z.enum(['pending', 'completed', 'cancelled']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const createTaskRequestSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  eventType: z.enum(['interview', 'call', 'meeting']),
  scheduledAt: z.string().datetime(),
})

export const updateTaskRequestSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
})

// Salary report schemas
export const salaryReportSchema = z.object({
  id: z.string(),
  position: z.string(),
  location: z.string().nullable(),
  avgSalary: z.number(),
  minSalary: z.number(),
  maxSalary: z.number(),
  currency: z.string(),
  source: z.string(),
  createdAt: z.string().datetime(),
})

export const createSalaryReportRequestSchema = z.object({
  position: z.string().min(1),
  location: z.string().optional(),
})

// Email schemas
export const emailLogSchema = z.object({
  id: z.string(),
  to: z.string().email(),
  subject: z.string(),
  body: z.string(),
  status: z.enum(['sent', 'failed', 'read']),
  createdAt: z.string().datetime(),
})

export const sendEmailRequestSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
})

// Daily digest schema
export const dailyDigestSchema = z.object({
  date: z.string().datetime(),
  newVacancies: z.number(),
  newResumes: z.number(),
  newMatches: z.number(),
  upcomingTasks: z.array(taskSchema),
  salaryChanges: z.array(z.object({
    position: z.string(),
    oldAvg: z.number(),
    newAvg: z.number(),
    change: z.number(),
  })),
})

// Search schemas
export const searchRequestSchema = z.object({
  text: z.string().min(1),
  type: z.enum(['vacancy', 'resume']).default('vacancy'),
  source: z.enum(['all', 'hh.ru', 'work.ua', 'robota.ua', 'linkedin']).default('all'),
  page: z.coerce.number().min(0).default(0),
  location: z.string().optional(),
})

export const searchResultItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string().optional(),
  location: z.string().nullable(),
  salaryFrom: z.number().nullable(),
  salaryTo: z.number().nullable(),
  currency: z.string().nullable(),
  description: z.string(),
  url: z.string(),
  source: z.enum(['hh.ru', 'work.ua', 'robota.ua', 'linkedin']),
  skills: z.array(z.string()).optional(),
  candidateName: z.string().optional(),
})

export const searchResponseSchema = z.array(searchResultItemSchema)

// Export types
export type Vacancy = z.infer<typeof vacancySchema>
export type CreateVacancyRequest = z.infer<typeof createVacancyRequestSchema>
export type UpdateVacancyRequest = z.infer<typeof updateVacancyRequestSchema>

export type Resume = z.infer<typeof resumeSchema>
export type CreateResumeRequest = z.infer<typeof createResumeRequestSchema>
export type UpdateResumeRequest = z.infer<typeof updateResumeRequestSchema>

export type Match = z.infer<typeof matchSchema>
export type CreateMatchRequest = z.infer<typeof createMatchRequestSchema>

export type Task = z.infer<typeof taskSchema>
export type CreateTaskRequest = z.infer<typeof createTaskRequestSchema>
export type UpdateTaskRequest = z.infer<typeof updateTaskRequestSchema>

export type SalaryReport = z.infer<typeof salaryReportSchema>
export type CreateSalaryReportRequest = z.infer<typeof createSalaryReportRequestSchema>

export type EmailLog = z.infer<typeof emailLogSchema>
export type SendEmailRequest = z.infer<typeof sendEmailRequestSchema>

export type DailyDigest = z.infer<typeof dailyDigestSchema>

export type SearchRequest = z.infer<typeof searchRequestSchema>
export type SearchResultItem = z.infer<typeof searchResultItemSchema>

