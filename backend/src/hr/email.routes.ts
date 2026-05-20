import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { sendEmailRequestSchema } from '@hr-recruiter/contracts'
import { HRService } from './service'
import { requireAuth } from '../auth/routes'
import type { Variables } from '../app'

import type { DbClient } from '../db'

export function createEmailRoutes(db: DbClient) {
  const service = new HRService(db)
  const app = new Hono<{ Variables: Variables }>()

  app.use('*', requireAuth)

  app.get('/logs', async (c) => {
    const user = c.get('user')
    const logs = await service.getEmailLogs(user.id)
    return c.json(logs)
  })

  app.post('/send', zValidator('json', sendEmailRequestSchema), async (c) => {
    const user = c.get('user')
    const data = c.req.valid('json')

    // Placeholder: actual email sending will be implemented with SMTP or Gmail API
    const log = await service.createEmailLog(user.id, data)
    return c.json({ success: true, log }, 201)
  })

  return app
}
