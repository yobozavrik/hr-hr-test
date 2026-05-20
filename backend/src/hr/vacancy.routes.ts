import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createVacancyRequestSchema, updateVacancyRequestSchema } from '@hr-recruiter/contracts'
import { HRService } from './service'
import { requireAuth } from '../auth/routes'
import type { Variables } from '../app'

import type { DbClient } from '../db'

export function createVacancyRoutes(db: DbClient) {
  const service = new HRService(db)
  const app = new Hono<{ Variables: Variables }>()

  app.use('*', requireAuth)

  app.get('/', async (c) => {
    const user = c.get('user')
    const vacancies = await service.getVacancies(user.id)
    return c.json(vacancies)
  })

  app.get('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')
    const vacancy = await service.getVacancy(user.id, id)

    if (!vacancy) {
      return c.json({ error: 'Vacancy not found' }, 404)
    }

    return c.json(vacancy)
  })

  app.post('/', zValidator('json', createVacancyRequestSchema), async (c) => {
    const user = c.get('user')
    const data = c.req.valid('json')
    const vacancy = await service.createVacancy(user.id, data)
    return c.json(vacancy, 201)
  })

  app.patch('/:id', zValidator('json', updateVacancyRequestSchema), async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')
    const data = c.req.valid('json')
    const result = await service.updateVacancy(user.id, id, data)

    if (result.count === 0) {
      return c.json({ error: 'Vacancy not found' }, 404)
    }

    return c.json({ success: true })
  })

  app.delete('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')
    const result = await service.deleteVacancy(user.id, id)

    if (result.count === 0) {
      return c.json({ error: 'Vacancy not found' }, 404)
    }

    return c.json({ success: true })
  })

  return app
}
