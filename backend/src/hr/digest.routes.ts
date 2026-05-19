import { Hono } from 'hono'
import { HRService } from './service'
import { requireAuth } from '../auth/routes'
import type { Variables } from '../app'

export function createDigestRoutes(db: any) {
  const service = new HRService(db)
  const app = new Hono<{ Variables: Variables }>()

  app.use('*', requireAuth)

  app.get('/daily', async (c) => {
    const user = c.get('user')
    const digest = await service.getDailyDigest(user.id)
    return c.json(digest)
  })

  return app
}
