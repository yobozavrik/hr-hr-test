import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { searchRequestSchema } from '@hr-recruiter/contracts'
import { requireAuth } from '../auth/routes'
import type { Variables } from '../app'

// Scrapers
import { WorkUaScraper } from '../integrations/work-ua.service'
import { RobotaUaScraper } from '../integrations/robota-ua.service'
import { LinkedInScraper } from '../integrations/linkedin.service'
import { HHService } from '../integrations/hh/service'
import { AIService } from '../integrations/ai.service'

export function createSearchRoutes(db: any) {
  const app = new Hono<{ Variables: Variables }>()

  const workScraper = new WorkUaScraper()
  const robotaScraper = new RobotaUaScraper()
  const linkedinScraper = new LinkedInScraper()
  const hhService = new HHService()
  const aiService = new AIService()

  app.use('*', requireAuth)

  // Unified Multi-Board Search Route
  app.get('/', zValidator('query', searchRequestSchema), async (c) => {
    const params = c.req.valid('query')
    const { text, type, source, page, location } = params

    console.log(`Starting multi-board search. Query: "${text}", Type: ${type}, Source: ${source}`)

    const searchParams = { text, page, location }
    const promises: Promise<any[]>[] = []

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

    // 4. HeadHunter (hh.ru)
    if (source === 'all' || source === 'hh.ru') {
      promises.push(
        (async () => {
          try {
            if (type === 'vacancy') {
              const res = await hhService.searchVacancies({ text, page })
              return res.items.map((item) => ({
                id: `hh_${item.id}`,
                title: item.name,
                company: item.employer?.name || 'Роботодавець',
                location: item.area?.name || 'Україна',
                salaryFrom: item.salary?.from || null,
                salaryTo: item.salary?.to || null,
                currency: item.salary?.currency || 'UAH',
                description: item.snippet?.requirement || item.snippet?.responsibility || 'Опис доступний на сайті.',
                url: item.alternate_url || `https://hh.ru/vacancy/${item.id}`,
                source: 'hh.ru' as const,
              }))
            } else {
              // Search resumes on hh.ru
              const res = await hhService.searchResumes({ text, page })
              // Since hh.ru resume list contains IDs only, we fetch details if possible or map
              return res.items.map((item) => ({
                id: `hh_resume_${item.id}`,
                title: text,
                candidateName: 'Шукач hh.ru',
                location: 'Україна',
                description: 'Резюме знайдено на hh.ru. Натисніть для детального перегляду.',
                url: item.url || `https://hh.ru/resume/${item.id}`,
                source: 'hh.ru' as const,
              }))
            }
          } catch (e) {
            console.error('HH search failed:', e)
            return [] // Fail gracefully
          }
        })()
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
    } catch (e: any) {
      console.error('Match analysis failed:', e)
      return c.json({ error: e.message || 'Analysis failed' }, 500)
    }
  })

  return app
}
