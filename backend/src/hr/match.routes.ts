import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createMatchRequestSchema } from '@hr-recruiter/contracts'
import { HRService } from './service'
import { requireAuth } from '../auth/routes'
import type { Variables } from '../app'

import type { DbClient } from '../db'

export function createMatchRoutes(db: DbClient) {
  const service = new HRService(db)
  const app = new Hono<{ Variables: Variables }>()

  app.use('*', requireAuth)

  app.get('/', async (c) => {
    const user = c.get('user')
    const matches = await service.getMatches(user.id)
    return c.json(matches)
  })

  app.post('/', zValidator('json', createMatchRequestSchema), async (c) => {
    const user = c.get('user')
    const data = c.req.valid('json')

    try {
      const match = await service.createMatch(user.id, data)
      return c.json(match, 201)
    } catch (error: any) {
      return c.json({ error: error.message }, 400)
    }
  })

  app.patch('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')
    const { status } = await c.req.json()

    try {
      const match = await service.updateMatch(user.id, id, status)
      return c.json(match)
    } catch (error: any) {
      return c.json({ error: error.message }, 400)
    }
  })

  return app
}
