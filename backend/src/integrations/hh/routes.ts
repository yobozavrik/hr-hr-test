import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { HHService } from './service'
import { requireAuth } from '../../auth/routes'
import type { Variables } from '../../app'

export function createHHRoutes() {
  const service = new HHService()
  const app = new Hono<{ Variables: Variables }>()

  app.use('*', requireAuth)

  // Search vacancies
  app.get('/vacancies', zValidator('query', z.object({
    text: z.string().min(1),
    area: z.string().optional(),
    salary: z.string().optional(),
    experience: z.string().optional(),
    employment: z.string().optional(),
    page: z.string().optional(),
  })), async (c) => {
    const query = c.req.valid('query')
    
    try {
      const result = await service.searchVacancies({
        text: query.text,
        area: query.area,
        salary: query.salary ? Number(query.salary) : undefined,
        experience: query.experience,
        employment: query.employment,
        page: query.page ? Number(query.page) : 0,
      })
      
      return c.json(result)
    } catch (error: any) {
      return c.json({ error: error.message }, 500)
    }
  })

  // Get vacancy details
  app.get('/vacancies/:id', async (c) => {
    const id = c.req.param('id')
    
    try {
      const vacancy = await service.getVacancy(id)
      return c.json(vacancy)
    } catch (error: any) {
      return c.json({ error: error.message }, 500)
    }
  })

  // Get areas (cities)
  app.get('/areas', async (c) => {
    try {
      const areas = await service.getAreas()
      return c.json(areas)
    } catch (error: any) {
      return c.json({ error: error.message }, 500)
    }
  })

  // Get dictionaries
  app.get('/dictionaries', async (c) => {
    try {
      const dicts = await service.getDictionaries()
      return c.json(dicts)
    } catch (error: any) {
      return c.json({ error: error.message }, 500)
    }
  })

  return app
}
