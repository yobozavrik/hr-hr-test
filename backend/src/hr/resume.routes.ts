import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createResumeRequestSchema, updateResumeRequestSchema } from '@hr-recruiter/contracts'
import { HRService } from './service'
import { requireAuth } from '../auth/routes'
import type { Variables } from '../app'

import type { DbClient } from '../db'

export function createResumeRoutes(db: DbClient) {
  const service = new HRService(db)
  const app = new Hono<{ Variables: Variables }>()

  app.use('*', requireAuth)

  app.get('/', async (c) => {
    const user = c.get('user')
    const resumes = await service.getResumes(user.id)
    return c.json(resumes)
  })

  app.get('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')
    const resume = await service.getResume(user.id, id)

    if (!resume) {
      return c.json({ error: 'Resume not found' }, 404)
    }

    return c.json(resume)
  })

  app.post('/', zValidator('json', createResumeRequestSchema), async (c) => {
    const user = c.get('user')
    const data = c.req.valid('json')
    const resume = await service.createResume(user.id, data)
    return c.json(resume, 201)
  })

  app.patch('/:id', zValidator('json', updateResumeRequestSchema), async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')
    const data = c.req.valid('json')
    const result = await service.updateResume(user.id, id, data)

    if (result.count === 0) {
      return c.json({ error: 'Resume not found' }, 404)
    }

    return c.json({ success: true })
  })

  app.delete('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')
    const result = await service.deleteResume(user.id, id)

    if (result.count === 0) {
      return c.json({ error: 'Resume not found' }, 404)
    }

    return c.json({ success: true })
  })

  return app
}
