import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {
  aiGenerateOutreachRequestSchema,
  aiAnalyzeSalaryRequestSchema,
  aiExpandSearchRequestSchema,
  aiTrackSalaryRequestSchema,
  aiTrackCompetitorsRequestSchema,
} from '@hr-recruiter/contracts'
import { AIService } from '../integrations/ai.service'
import { requireAuth } from '../auth/routes'
import type { Variables } from '../app'

export function createAIRoutes() {
  const aiService = new AIService()
  const app = new Hono<{ Variables: Variables }>()

  // Guard all AI endpoints with authentication
  app.use('*', requireAuth)

  // Sofia Outreach Email Generator
  app.post(
    '/outreach',
    zValidator('json', aiGenerateOutreachRequestSchema),
    async (c) => {
      const { candidateName, candidatePosition, vacancyTitle } = c.req.valid('json')
      const result = await aiService.generateOutreach({
        candidateName,
        candidatePosition,
        vacancyTitle
      })
      return c.json(result)
    }
  )

  // Danilo Salary Analytics
  app.post(
    '/salary',
    zValidator('json', aiAnalyzeSalaryRequestSchema),
    async (c) => {
      const { position } = c.req.valid('json')
      const result = await aiService.analyzeSalary({ position })
      return c.json(result)
    }
  )

  // Marta Search Query Expander
  app.post(
    '/expand',
    zValidator('json', aiExpandSearchRequestSchema),
    async (c) => {
      const { text } = c.req.valid('json')
      const result = await aiService.expandSearchQuery({ text })
      return c.json(result)
    }
  )

  // Maksym Salary Tracker
  app.post(
    '/salary-track',
    zValidator('json', aiTrackSalaryRequestSchema),
    async (c) => {
      const { position, budget } = c.req.valid('json')
      const result = await aiService.trackSalary({ position, budget })
      return c.json(result)
    }
  )

  // Olena Competitor Tracker
  app.post(
    '/competitors',
    zValidator('json', aiTrackCompetitorsRequestSchema),
    async (c) => {
      const { company, niche } = c.req.valid('json')
      const result = await aiService.trackCompetitors({ company, niche })
      return c.json(result)
    }
  )

  return app
}
