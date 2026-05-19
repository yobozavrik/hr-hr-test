import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
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
    zValidator(
      'json',
      z.object({
        candidateName: z.string().min(1),
        candidatePosition: z.string().min(1),
        vacancyTitle: z.string().min(1)
      })
    ),
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
    zValidator(
      'json',
      z.object({
        position: z.string().min(1)
      })
    ),
    async (c) => {
      const { position } = c.req.valid('json')
      const result = await aiService.analyzeSalary({ position })
      return c.json(result)
    }
  )

  // Marta Search Query Expander
  app.post(
    '/expand',
    zValidator(
      'json',
      z.object({
        text: z.string().min(1)
      })
    ),
    async (c) => {
      const { text } = c.req.valid('json')
      const result = await aiService.expandSearchQuery({ text })
      return c.json(result)
    }
  )

  return app
}
