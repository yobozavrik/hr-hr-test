import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createSalaryReportRequestSchema } from '@hr-recruiter/contracts'
import { HRService } from './service'
import { requireAuth } from '../auth/routes'
import type { Variables } from '../app'

import type { DbClient } from '../db'

export function createSalaryRoutes(db: DbClient) {
  const service = new HRService(db)
  const app = new Hono<{ Variables: Variables }>()

  app.use('*', requireAuth)

  app.get('/reports', async (c) => {
    const user = c.get('user')
    const reports = await service.getSalaryReports(user.id)
    return c.json(reports)
  })

  app.post('/reports', zValidator('json', createSalaryReportRequestSchema), async (c) => {
    const user = c.get('user')
    const data = c.req.valid('json')
    const report = await service.createSalaryReport(user.id, data)
    return c.json(report, 201)
  })

  return app
}
