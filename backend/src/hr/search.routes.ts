import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { searchRequestSchema } from '@hr-recruiter/contracts'
import { requireAuth } from '../auth/routes'
import type { Variables } from '../app'

// Scrapers
import { WorkUaScraper } from '../integrations/work-ua.service'
import { RobotaUaScraper } from '../integrations/robota-ua.service'
import { LinkedInScraper } from '../integrations/linkedin.service'
import { AIService } from '../integrations/ai.service'
import type { ScrapedItem } from '../integrations/scraper.interface'

import type { DbClient } from '../db'

export function createSearchRoutes(db: DbClient) {
  const app = new Hono<{ Variables: Variables }>()

  const workScraper = new WorkUaScraper()
  const robotaScraper = new RobotaUaScraper()
  const linkedinScraper = new LinkedInScraper()
  const aiService = new AIService()

  app.use('*', requireAuth)

  // Unified Multi-Board Search Route
  app.get('/', zValidator('query', searchRequestSchema), async (c) => {
    const params = c.req.valid('query')
    const { text, type, source, page, location } = params

    console.log(`Starting multi-board search. Query: "${text}", Type: ${type}, Source: ${source}`)

    const searchParams = { text, page, location }
    const promises: Promise<ScrapedItem[]>[] = []

    // 1. Work.ua
    if (source === 'all' || source === 'work.ua') {
      promises.push(
        type === 'vacancy'
          ? workScraper.searchVacancies(searchParams)
          : workScraper.searchResumes(searchParams)
      )
    }

    // 2. Robota.ua
    if (source === 'all' || source === 'robota.ua') {
      promises.push(
        type === 'vacancy'
          ? robotaScraper.searchVacancies(searchParams)
          : robotaScraper.searchResumes(searchParams)
      )
    }

    // 3. LinkedIn
    if (source === 'all' || source === 'linkedin') {
      promises.push(
        type === 'vacancy'
          ? linkedinScraper.searchVacancies(searchParams)
          : linkedinScraper.searchResumes(searchParams)
      )
    }


    // Execute searches concurrently
    const resultsArrays = await Promise.all(promises)
    const mergedResults = resultsArrays.flat()

    return c.json(mergedResults)
  })

  // Real-Time Match Analysis Route (On-the-fly AI Scorer)
  app.post('/match-analyze', async (c) => {
    try {
      const body = await c.req.json() as {
        vacancy: { title: string; description: string }
        resume: { name: string; position: string; skills: string[]; experience?: string; education?: string }
      }

      if (!body.vacancy || !body.resume) {
        return c.json({ error: 'Vacancy and resume data are required for analysis' }, 400)
      }

      const analysis = await aiService.analyzeMatch({
        vacancyTitle: body.vacancy.title,
        vacancyDescription: body.vacancy.description,
        candidateName: body.resume.name,
        candidatePosition: body.resume.position,
        candidateSkills: body.resume.skills,
        candidateExperience: body.resume.experience,
        candidateEducation: body.resume.education,
      })

      return c.json(analysis)
    } catch (e) {
      console.error('Match analysis failed:', e)
      const message = e instanceof Error ? e.message : 'Analysis failed'
      return c.json({ error: message }, 500)
    }
  })

  return app
}
